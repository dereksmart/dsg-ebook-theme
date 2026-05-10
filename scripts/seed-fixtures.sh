#!/usr/bin/env bash
set -euo pipefail

THEME_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FIXTURE_FILE="${1:-$THEME_DIR/fixtures/reader-content.json}"

if [[ ! -f "$FIXTURE_FILE" ]]; then
	echo "Missing fixture file at $FIXTURE_FILE" >&2
	exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
	echo "Fixture seeding requires jq." >&2
	exit 1
fi

cd "$THEME_DIR"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

wp_local() {
	npx wp-env run cli wp "$@" < /dev/null
}

delete_existing_content() {
	local ids

	ids="$(wp_local post list --post_type=page,post --post_status=any --format=ids | tr -d '\r')"
	if [[ -n "$ids" ]]; then
		wp_local post delete $ids --force >/dev/null
	fi
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

seed_collection() {
	local post_type="$1"
	local collection="$2"

	jq -c "$collection[]" "$FIXTURE_FILE" | while read -r row; do
		local slug
		local title
		local status
		local date
		local content_file
		local excerpt_file

		slug="$(jq -r '.slug' <<< "$row")"
		title="$(jq -r '.title // ""' <<< "$row")"
		status="$(jq -r '.status // "publish"' <<< "$row")"
		date="$(jq -r '.date // "now"' <<< "$row")"
		content_file="$TMP_DIR/$post_type-$slug-content.html"
		excerpt_file="$TMP_DIR/$post_type-$slug-excerpt.html"

		jq -r '.content // ""' <<< "$row" > "$content_file"
		jq -r '.excerpt // ""' <<< "$row" > "$excerpt_file"
		upsert_post "$post_type" "$slug" "$title" "$status" "$date" "$content_file" "$excerpt_file"
	done
}

wp_local theme activate dsg-ereader-theme >/dev/null
wp_local option update blogname "$(jq -r '.site.blogname // "derek smart-gordon"' "$FIXTURE_FILE")" >/dev/null
wp_local option update blogdescription "$(jq -r '.site.blogdescription // ""' "$FIXTURE_FILE")" >/dev/null
wp_local rewrite structure '/%postname%/' --hard >/dev/null

delete_existing_content
seed_collection page '.pages'
seed_collection post '.posts'

echo "Local WordPress fixture content seeded."
