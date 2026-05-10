#!/usr/bin/env bash
set -euo pipefail

THEME_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE_DIR="$(cd "$THEME_DIR/.." && pwd)"
SECRETS_FILE="$SITE_DIR/.secrets/wp-staging.env"

if [[ ! -f "$SECRETS_FILE" ]]; then
	echo "Missing staging credentials at $SECRETS_FILE" >&2
	exit 1
fi

set -a
# shellcheck source=/dev/null
source "$SECRETS_FILE"
set +a

if [[ -z "${WP_BASE_URL:-}" || -z "${WP_USERNAME:-}" || -z "${WP_APP_PASSWORD:-}" ]]; then
	echo "Expected WP_BASE_URL, WP_USERNAME, and WP_APP_PASSWORD in $SECRETS_FILE" >&2
	exit 1
fi

cd "$THEME_DIR"

API="${WP_BASE_URL%/}/wp-json/wp/v2"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

wp_local() {
	npx wp-env run cli wp "$@" < /dev/null
}

fetch_json() {
	local endpoint="$1"
	local output="$2"
	curl -fsS -u "$WP_USERNAME:$WP_APP_PASSWORD" "$API/$endpoint" > "$output"
}

upsert_post() {
	local post_type="$1"
	local slug="$2"
	local title="$3"
	local status="$4"
	local date="$5"
	local content_file="$6"
	local excerpt_file="$7"
	local existing_id

	existing_id="$(wp_local post list --post_type="$post_type" --name="$slug" --field=ID --format=ids | tr -d '\r' | head -n 1)"

	if [[ -n "$existing_id" ]]; then
		wp_local post update "$existing_id" \
			--post_title="$title" \
			--post_name="$slug" \
			--post_status="$status" \
			--post_date="$date" \
			--post_content="$(< "$content_file")" \
			--post_excerpt="$(< "$excerpt_file")" >/dev/null
	else
		wp_local post create \
			--post_type="$post_type" \
			--post_title="$title" \
			--post_name="$slug" \
			--post_status="$status" \
			--post_date="$date" \
			--post_content="$(< "$content_file")" \
			--post_excerpt="$(< "$excerpt_file")" >/dev/null
	fi
}

delete_default_content() {
	local post_type="$1"
	local slug="$2"
	local ids

	ids="$(wp_local post list --post_type="$post_type" --name="$slug" --field=ID --format=ids | tr -d '\r')"
	if [[ -n "$ids" ]]; then
		wp_local post delete $ids --force >/dev/null
	fi
}

fetch_json 'pages?context=edit&per_page=100&_fields=slug,status,title,content,excerpt,date' "$TMP_DIR/pages.json"
fetch_json 'posts?context=edit&per_page=100&_fields=slug,status,title,content,excerpt,date' "$TMP_DIR/posts.json"

wp_local option update blogname 'derek smart-gordon' >/dev/null
wp_local option update blogdescription 'Dev lead. Building AI things at Automattic.' >/dev/null
delete_default_content page sample-page
delete_default_content post hello-world

jq -c '.[]' "$TMP_DIR/pages.json" | while read -r row; do
	slug="$(jq -r '.slug' <<< "$row")"
	title="$(jq -r '.title.raw // .title.rendered // ""' <<< "$row")"
	status="$(jq -r '.status // "publish"' <<< "$row")"
	date="$(jq -r '.date // "now"' <<< "$row")"
	content_file="$TMP_DIR/page-$slug-content.html"
	excerpt_file="$TMP_DIR/page-$slug-excerpt.html"
	jq -r '.content.raw // .content.rendered // ""' <<< "$row" > "$content_file"
	jq -r '.excerpt.raw // .excerpt.rendered // ""' <<< "$row" > "$excerpt_file"
	upsert_post page "$slug" "$title" "$status" "$date" "$content_file" "$excerpt_file"
done

jq -c '.[]' "$TMP_DIR/posts.json" | while read -r row; do
	slug="$(jq -r '.slug' <<< "$row")"
	title="$(jq -r '.title.raw // .title.rendered // ""' <<< "$row")"
	status="$(jq -r '.status // "publish"' <<< "$row")"
	date="$(jq -r '.date // "now"' <<< "$row")"
	content_file="$TMP_DIR/post-$slug-content.html"
	excerpt_file="$TMP_DIR/post-$slug-excerpt.html"
	jq -r '.content.raw // .content.rendered // ""' <<< "$row" > "$content_file"
	jq -r '.excerpt.raw // .excerpt.rendered // ""' <<< "$row" > "$excerpt_file"
	upsert_post post "$slug" "$title" "$status" "$date" "$content_file" "$excerpt_file"
done

wp_local theme activate dsg-ebook-theme >/dev/null

echo "Local WordPress content synced from staging."
