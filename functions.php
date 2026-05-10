<?php
/**
 * DSG Ebook — theme bootstrap.
 *
 * The theme treats the whole site like a book. This file:
 *   - registers theme support and assets
 *   - prints the saved theme/size attribute before paint to avoid FOUC
 *   - registers the dsg/chapter-number dynamic block (auto-numbered chapters)
 *   - exposes a small reading-time helper used by template parts
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const DSG_EBOOK_VERSION = '0.1.5';

/**
 * Theme support.
 */
function dsg_ebook_setup() {
	add_theme_support( 'block-templates' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'editor-styles' );
	add_theme_support( 'wp-block-styles' );
}
add_action( 'after_setup_theme', 'dsg_ebook_setup' );

/**
 * Front-end assets.
 */
function dsg_ebook_enqueue() {
	wp_enqueue_style(
		'dsg-ebook-fonts',
		'https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,600;1,7..72,400&family=JetBrains+Mono:wght@400;500&display=swap',
		array(),
		null
	);
	wp_enqueue_style(
		'dsg-ebook-reader',
		get_theme_file_uri( 'assets/reader.css' ),
		array( 'dsg-ebook-fonts' ),
		DSG_EBOOK_VERSION
	);
	wp_enqueue_script(
		'dsg-ebook-reader',
		get_theme_file_uri( 'assets/reader.js' ),
		array(),
		DSG_EBOOK_VERSION,
		array(
			'in_footer' => true,
			'strategy'  => 'defer',
		)
	);
}
add_action( 'wp_enqueue_scripts', 'dsg_ebook_enqueue', 20 );

/**
 * Editor-only assets — registers Footnote / Define / Highlight inline formats
 * so authors get them in the rich-text toolbar like Bold and Italic.
 */
function dsg_ebook_enqueue_editor() {
	wp_enqueue_script(
		'dsg-ebook-formats',
		get_theme_file_uri( 'assets/editor-formats.js' ),
		array( 'wp-rich-text', 'wp-element', 'wp-components', 'wp-block-editor', 'wp-i18n' ),
		DSG_EBOOK_VERSION,
		true
	);
}
add_action( 'enqueue_block_editor_assets', 'dsg_ebook_enqueue_editor' );

/**
 * Print the saved theme + base size before paint to avoid FOUC.
 */
function dsg_ebook_preference_script() {
	?>
	<script>
		(function () {
			try {
				var t = localStorage.getItem('dsg-ebook-theme-idx');
				var s = localStorage.getItem('dsg-ebook-size-idx');
				var sizes = [16, 17, 18, 20, 22];
				var themes = ['light', 'dark'];
				var ti = parseInt(t, 10); if (isNaN(ti) || ti < 0 || ti >= themes.length) ti = 0;
				var si = parseInt(s, 10); if (isNaN(si) || si < 0 || si >= sizes.length) si = 2;
				document.documentElement.setAttribute('data-theme', themes[ti]);
				document.documentElement.style.setProperty('--dsg-base-size', sizes[si] + 'px');
			} catch (e) {
				document.documentElement.setAttribute('data-theme', 'light');
			}
		})();
	</script>
	<?php
}
add_action( 'wp_head', 'dsg_ebook_preference_script', 0 );

/**
 * Register dynamic blocks. Currently just the chapter-number renderer.
 */
function dsg_ebook_register_blocks() {
	register_block_type(
		'dsg/chapter-number',
		array(
			'api_version'     => 3,
			'render_callback' => 'dsg_ebook_render_chapter_number',
		)
	);
	register_block_type(
		'dsg/page-chapter',
		array(
			'api_version'     => 3,
			'attributes'      => array(
				'slug'    => array( 'type' => 'string' ),
				'id'      => array( 'type' => 'string' ),
				'chapter' => array( 'type' => 'string' ),
				'title'   => array( 'type' => 'string' ),
				'dek'     => array( 'type' => 'string' ),
				'dropcap' => array( 'type' => 'boolean' ),
			),
			'render_callback' => 'dsg_ebook_render_page_chapter',
		)
	);
	register_block_type(
		'dsg/projects-chapter',
		array(
			'api_version'     => 3,
			'attributes'      => array(
				'slug'    => array( 'type' => 'string' ),
				'id'      => array( 'type' => 'string' ),
				'chapter' => array( 'type' => 'string' ),
				'title'   => array( 'type' => 'string' ),
				'dek'     => array( 'type' => 'string' ),
			),
			'render_callback' => 'dsg_ebook_render_projects_chapter',
		)
	);
}
add_action( 'init', 'dsg_ebook_register_blocks' );

/**
 * Render a front-page chapter from a normal WordPress page.
 *
 * This keeps the Kindle front page dynamic without making the content live in
 * template HTML. Authors can edit /about/ and /projects/ normally; the homepage
 * chapter follows along.
 */
function dsg_ebook_render_page_chapter( $attributes ) {
	$slug = isset( $attributes['slug'] ) ? sanitize_title( $attributes['slug'] ) : '';
	if ( '' === $slug ) {
		return '';
	}

	$page = get_page_by_path( $slug );
	if ( ! $page || 'publish' !== get_post_status( $page ) ) {
		return '';
	}

	$id      = isset( $attributes['id'] ) && '' !== $attributes['id'] ? sanitize_title( $attributes['id'] ) : $slug;
	$chapter = isset( $attributes['chapter'] ) ? $attributes['chapter'] : '';
	$title   = isset( $attributes['title'] ) && '' !== $attributes['title'] ? $attributes['title'] : get_the_title( $page );
	$dek     = isset( $attributes['dek'] ) ? $attributes['dek'] : '';
	$dropcap = ! empty( $attributes['dropcap'] );

	$content = apply_filters( 'the_content', $page->post_content );
	$content_class = 'dsg-page-content' . ( $dropcap ? ' has-dropcap' : '' );

	ob_start();
	?>
	<section id="<?php echo esc_attr( $id ); ?>" class="dsg-chapter dsg-page-chapter">
		<?php if ( '' !== $chapter ) : ?>
			<div class="dsg-chapter-num"><?php echo esc_html( $chapter ); ?></div>
		<?php endif; ?>
		<h2 class="dsg-chapter-title has-text-align-center"><?php echo esc_html( $title ); ?></h2>
		<?php if ( '' !== $dek ) : ?>
			<p class="dsg-chapter-dek has-text-align-center"><?php echo esc_html( $dek ); ?></p>
		<?php endif; ?>
		<div class="<?php echo esc_attr( $content_class ); ?>">
			<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		</div>
		<div class="dsg-ornament" aria-hidden="true">· · ·</div>
	</section>
	<?php
	return ob_get_clean();
}

/**
 * Render the Projects page as a purpose-built reader list.
 *
 * The Projects page is currently edited as headings plus Columns/Card blocks.
 * This renderer parses those blocks and emits a stable homepage layout so the
 * editor can stay easy without making the homepage inherit card/grid markup.
 */
function dsg_ebook_render_projects_chapter( $attributes ) {
	$slug = isset( $attributes['slug'] ) ? sanitize_title( $attributes['slug'] ) : 'projects';
	$page = get_page_by_path( $slug );
	if ( ! $page || 'publish' !== get_post_status( $page ) ) {
		return '';
	}

	$id      = isset( $attributes['id'] ) && '' !== $attributes['id'] ? sanitize_title( $attributes['id'] ) : 'works';
	$chapter = isset( $attributes['chapter'] ) ? $attributes['chapter'] : '';
	$title   = isset( $attributes['title'] ) && '' !== $attributes['title'] ? $attributes['title'] : get_the_title( $page );
	$dek     = isset( $attributes['dek'] ) ? $attributes['dek'] : '';
	$outline = dsg_ebook_project_outline_from_page( $page );

	if ( empty( $outline['groups'] ) ) {
		return dsg_ebook_render_page_chapter( $attributes );
	}

	ob_start();
	?>
	<section id="<?php echo esc_attr( $id ); ?>" class="dsg-chapter dsg-works-chapter">
		<?php if ( '' !== $chapter ) : ?>
			<div class="dsg-chapter-num"><?php echo esc_html( $chapter ); ?></div>
		<?php endif; ?>
		<h2 class="dsg-chapter-title has-text-align-center"><?php echo esc_html( $title ); ?></h2>
		<?php if ( '' !== $dek ) : ?>
			<p class="dsg-chapter-dek has-text-align-center"><?php echo esc_html( $dek ); ?></p>
		<?php endif; ?>
		<?php if ( '' !== $outline['intro'] ) : ?>
			<p class="dsg-works-intro"><?php echo esc_html( $outline['intro'] ); ?></p>
		<?php endif; ?>
		<div class="dsg-works-list">
			<?php foreach ( $outline['groups'] as $group ) : ?>
				<div class="dsg-work-group">
					<h3 class="dsg-work-group-title"><?php echo esc_html( $group['title'] ); ?></h3>
					<div class="dsg-work-items">
						<?php foreach ( $group['items'] as $item ) : ?>
							<article class="dsg-work-item">
								<div class="dsg-work-kicker"><?php echo esc_html( $item['kicker'] ); ?></div>
								<div class="dsg-work-copy">
									<h4 class="dsg-work-title">
										<?php if ( '' !== $item['href'] ) : ?>
											<a href="<?php echo esc_url( $item['href'] ); ?>"><?php echo esc_html( $item['title'] ); ?></a>
										<?php else : ?>
											<?php echo esc_html( $item['title'] ); ?>
										<?php endif; ?>
									</h4>
									<?php if ( '' !== $item['summary'] ) : ?>
										<p class="dsg-work-summary"><?php echo esc_html( $item['summary'] ); ?></p>
									<?php endif; ?>
								</div>
							</article>
						<?php endforeach; ?>
					</div>
				</div>
			<?php endforeach; ?>
		</div>
		<div class="dsg-ornament" aria-hidden="true">· · ·</div>
	</section>
	<?php
	return ob_get_clean();
}

/**
 * Parse the Projects page block content into intro, group, and project entries.
 */
function dsg_ebook_project_outline_from_page( $page ) {
	$outline = array(
		'intro'  => '',
		'groups' => array(),
	);
	$current = -1;

	foreach ( parse_blocks( $page->post_content ) as $block ) {
		$block_name = $block['blockName'] ?? '';
		if ( 'core/paragraph' === $block_name && '' === $outline['intro'] && empty( $outline['groups'] ) ) {
			$outline['intro'] = dsg_ebook_plain_block_text( $block );
			continue;
		}

		if ( 'core/heading' === $block_name && 2 === (int) ( $block['attrs']['level'] ?? 2 ) ) {
			$title = dsg_ebook_plain_block_text( $block );
			if ( '' !== $title ) {
				$outline['groups'][] = array(
					'title' => $title,
					'items' => array(),
				);
				$current = count( $outline['groups'] ) - 1;
			}
			continue;
		}

		if ( 'core/columns' === $block_name ) {
			if ( -1 === $current ) {
				$outline['groups'][] = array(
					'title' => 'Selected',
					'items' => array(),
				);
				$current = 0;
			}

			foreach ( $block['innerBlocks'] as $column ) {
				$item = dsg_ebook_project_item_from_column( $column );
				if ( '' !== $item['title'] ) {
					$outline['groups'][ $current ]['items'][] = $item;
				}
			}
		}
	}

	$outline['groups'] = array_values(
		array_filter(
			$outline['groups'],
			function ( $group ) {
				return ! empty( $group['items'] );
			}
		)
	);

	return $outline;
}

/**
 * Extract a single project entry from one Column block.
 */
function dsg_ebook_project_item_from_column( $column ) {
	$item = array(
		'kicker'  => '',
		'title'   => '',
		'href'    => '',
		'summary' => '',
	);

	foreach ( $column['innerBlocks'] as $block ) {
		$block_name = $block['blockName'] ?? '';
		if ( 'core/paragraph' === $block_name ) {
			$text = dsg_ebook_plain_block_text( $block );
			if ( '' === $text ) {
				continue;
			}
			if ( '' === $item['kicker'] ) {
				$item['kicker'] = $text;
			} elseif ( '' === $item['summary'] ) {
				$item['summary'] = $text;
			}
			continue;
		}

		if ( 'core/heading' === $block_name ) {
			$html          = render_block( $block );
			$item['title'] = wp_strip_all_tags( $html );
			$item['href']  = dsg_ebook_first_link_href( $html );
		}
	}

	return $item;
}

/**
 * Render a parsed block and return plain, normalized text.
 */
function dsg_ebook_plain_block_text( $block ) {
	return trim( preg_replace( '/\s+/', ' ', wp_strip_all_tags( render_block( $block ) ) ) );
}

/**
 * Return the first link href in a small HTML fragment.
 */
function dsg_ebook_first_link_href( $html ) {
	if ( class_exists( 'WP_HTML_Tag_Processor' ) ) {
		$processor = new WP_HTML_Tag_Processor( $html );
		if ( $processor->next_tag( 'a' ) ) {
			return (string) $processor->get_attribute( 'href' );
		}
	}

	if ( preg_match( '/<a\s[^>]*href=(["\'])(.*?)\1/i', $html, $matches ) ) {
		return html_entity_decode( $matches[2], ENT_QUOTES );
	}

	return '';
}

/**
 * Render "Chapter One" / "Chapter Two" / etc. for the current post.
 * Position is computed against all published posts ordered oldest-first,
 * so the very first published post is Chapter One.
 */
function dsg_ebook_render_chapter_number( $attributes, $content, $block ) {
	if ( ! is_singular( 'post' ) ) {
		return '';
	}
	$position = dsg_ebook_chapter_position( get_the_ID() );
	if ( ! $position ) {
		return '';
	}
	return '<div class="dsg-chapter-num">Chapter ' . esc_html( dsg_ebook_number_word( $position ) ) . '</div>';
}

/**
 * Return the chapter position (1-based) of $post_id among all published posts,
 * with results memoized for the request.
 */
function dsg_ebook_chapter_position( $post_id ) {
	static $cache = null;
	if ( null === $cache ) {
		$cache = array();
		$ids   = get_posts(
			array(
				'post_type'      => 'post',
				'post_status'    => 'publish',
				'posts_per_page' => -1,
				'orderby'        => 'date',
				'order'          => 'ASC',
				'fields'         => 'ids',
			)
		);
		foreach ( $ids as $i => $id ) {
			$cache[ (int) $id ] = $i + 1;
		}
	}
	$post_id = (int) $post_id;
	return isset( $cache[ $post_id ] ) ? $cache[ $post_id ] : 0;
}

/**
 * Number-to-word for chapter headings (1..20). Falls back to the numeric form
 * once you ship more than twenty posts, which is its own kind of milestone.
 */
function dsg_ebook_number_word( $n ) {
	$words = array(
		1  => 'One',     2  => 'Two',      3  => 'Three',    4  => 'Four',     5  => 'Five',
		6  => 'Six',     7  => 'Seven',    8  => 'Eight',    9  => 'Nine',     10 => 'Ten',
		11 => 'Eleven',  12 => 'Twelve',   13 => 'Thirteen', 14 => 'Fourteen', 15 => 'Fifteen',
		16 => 'Sixteen', 17 => 'Seventeen',18 => 'Eighteen', 19 => 'Nineteen', 20 => 'Twenty',
	);
	$n = (int) $n;
	return isset( $words[ $n ] ) ? $words[ $n ] : (string) $n;
}

/**
 * Reading time in whole minutes for a given post (or the queried post).
 * 220 wpm is the rough average for English prose on screens.
 */
function dsg_ebook_reading_minutes( $post_id = null ) {
	$post = $post_id ? get_post( $post_id ) : get_post();
	if ( ! $post ) {
		return 1;
	}
	$words = str_word_count( wp_strip_all_tags( $post->post_content ) );
	return max( 1, (int) round( $words / 220 ) );
}
