<?php
/**
 * DSG E-reader — theme bootstrap.
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

const DSG_EREADER_VERSION = '0.1.37';

/**
 * Theme support.
 */
function dsg_ebook_setup() {
	add_theme_support( 'block-templates' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'editor-styles' );
	add_theme_support( 'wp-block-styles' );
	add_editor_style( 'assets/editor.css' );
}
add_action( 'after_setup_theme', 'dsg_ebook_setup' );

/**
 * Front-end assets.
 */
function dsg_ebook_enqueue() {
	wp_enqueue_style(
		'dsg-ereader-fonts',
		'https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,600;1,7..72,400&family=JetBrains+Mono:wght@400;500&display=swap',
		array(),
		null
	);
	wp_enqueue_style(
		'dsg-ereader-reader',
		get_theme_file_uri( 'assets/reader.css' ),
		array( 'dsg-ereader-fonts' ),
		DSG_EREADER_VERSION
	);
	wp_enqueue_script(
		'dsg-ereader-reader',
		get_theme_file_uri( 'assets/reader.js' ),
		array(),
		DSG_EREADER_VERSION,
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
	wp_enqueue_style(
		'dsg-ereader-fonts',
		'https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,600;1,7..72,400&family=JetBrains+Mono:wght@400;500&display=swap',
		array(),
		null
	);
	wp_enqueue_script(
		'dsg-ereader-formats',
		get_theme_file_uri( 'assets/editor-formats.js' ),
		array( 'wp-rich-text', 'wp-element', 'wp-components', 'wp-block-editor', 'wp-i18n' ),
		DSG_EREADER_VERSION,
		true
	);
}
add_action( 'enqueue_block_editor_assets', 'dsg_ebook_enqueue_editor' );

/**
 * Print the saved theme + reader scale before paint to avoid FOUC.
 */
function dsg_ebook_preference_script() {
	?>
	<script>
		(function () {
			try {
				var sizes = [
					['small', '0.94', '17px', '15px', '21px', '23px', '39px', '39px', '27px', '13px', '19px', '13px', '10px', '68px', '23px', '13px', '17px', '10px'],
					['base', '1', '18px', '16px', '22px', '24px', '42px', '42px', '28px', '13px', '20px', '14px', '11px', '72px', '24px', '14px', '18px', '10px'],
					['large', '1.12', '20px', '18px', '25px', '27px', '47px', '47px', '31px', '15px', '22px', '15px', '12px', '80px', '27px', '15px', '20px', '11px'],
					['xlarge', '1.24', '22px', '20px', '27px', '30px', '52px', '52px', '34px', '16px', '25px', '16px', '12px', '88px', '30px', '16px', '22px', '12px']
				];
				var vars = [
					'--dsg-reader-scale',
					'--dsg-copy-size',
					'--dsg-small-copy-size',
					'--dsg-list-title-size',
					'--dsg-section-title-size',
					'--dsg-chapter-title-size',
					'--dsg-archive-title-size',
					'--dsg-toc-heading-size',
					'--dsg-toc-subtitle-size',
					'--dsg-coda-note-size',
					'--dsg-label-size',
					'--dsg-small-label-size',
					'--dsg-cover-title-size',
					'--dsg-cover-subtitle-size',
					'--dsg-cover-author-size',
					'--dsg-cover-author-name-size',
					'--dsg-cover-meta-size'
				];
				var step = parseInt(localStorage.getItem('dsg-reader-size-step'), 10);
				if (isNaN(step)) {
					var oldStep = parseInt(localStorage.getItem('dsg-ebook-size-idx'), 10);
					step = oldStep <= 1 ? 0 : oldStep === 2 ? 1 : oldStep === 3 ? 2 : 3;
				}
				if (isNaN(step) || step < 0 || step >= sizes.length) step = 1;
				var theme = localStorage.getItem('dsg-reader-theme');
				if (theme !== 'light' && theme !== 'dark') {
					theme = parseInt(localStorage.getItem('dsg-ebook-theme-idx'), 10) === 1 ? 'dark' : 'light';
				}
				var fonts = {
					serif: "Literata, 'Iowan Old Style', Georgia, serif",
					sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
					mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
				};
				var font = localStorage.getItem('dsg-reader-font');
				if (!Object.prototype.hasOwnProperty.call(fonts, font)) font = 'serif';
				var widths = {
					narrow: ['680px', '600px'],
					standard: ['760px', '680px'],
					wide: ['880px', '760px']
				};
				var width = localStorage.getItem('dsg-reader-page-width');
				if (!Object.prototype.hasOwnProperty.call(widths, width)) width = 'standard';
				var leadings = {
					tight: ['1.52', '1.42'],
					standard: ['1.68', '1.55'],
					loose: ['1.82', '1.68']
				};
				var leading = localStorage.getItem('dsg-reader-line-height');
				if (!Object.prototype.hasOwnProperty.call(leadings, leading)) leading = 'standard';
				document.documentElement.setAttribute('data-reader-size', sizes[step][0]);
				for (var i = 0; i < vars.length; i++) {
					document.documentElement.style.setProperty(vars[i], sizes[step][i + 1]);
				}
				document.documentElement.setAttribute('data-theme', theme);
				document.documentElement.setAttribute('data-reader-font', font);
				document.documentElement.style.setProperty('--dsg-reader-font', fonts[font]);
				document.documentElement.setAttribute('data-reader-width', width);
				document.documentElement.style.setProperty('--dsg-page-width', widths[width][0]);
				document.documentElement.style.setProperty('--dsg-reading-width', widths[width][1]);
				document.documentElement.setAttribute('data-reader-leading', leading);
				document.documentElement.style.setProperty('--dsg-reader-line-height', leadings[leading][0]);
				document.documentElement.style.setProperty('--dsg-reader-small-line-height', leadings[leading][1]);
			} catch (e) {
				document.documentElement.setAttribute('data-reader-size', 'base');
				document.documentElement.style.setProperty('--dsg-reader-scale', 1);
				document.documentElement.setAttribute('data-theme', 'light');
				document.documentElement.setAttribute('data-reader-font', 'serif');
				document.documentElement.setAttribute('data-reader-width', 'standard');
				document.documentElement.setAttribute('data-reader-leading', 'standard');
			}
		})();
	</script>
	<?php
}
add_action( 'wp_head', 'dsg_ebook_preference_script', 0 );

/**
 * Register dynamic blocks.
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
		__DIR__ . '/blocks/book-cover',
		array(
			'render_callback' => 'dsg_ebook_render_book_cover',
		)
	);
	register_block_type(
		__DIR__ . '/blocks/contents',
		array(
			'render_callback' => 'dsg_ebook_render_contents',
		)
	);
	register_block_type(
		__DIR__ . '/blocks/reader-header',
		array(
			'render_callback' => 'dsg_ebook_render_reader_header',
		)
	);
	register_block_type(
		__DIR__ . '/blocks/reader-footer',
		array(
			'render_callback' => 'dsg_ebook_render_reader_footer',
		)
	);
	register_block_type(
		__DIR__ . '/blocks/essay-navigation',
		array(
			'render_callback' => 'dsg_ebook_render_essay_navigation',
		)
	);
	register_block_type(
		__DIR__ . '/blocks/page-chapter',
		array(
			'render_callback' => 'dsg_ebook_render_page_chapter',
		)
	);
	register_block_type(
		__DIR__ . '/blocks/projects-chapter',
		array(
			'render_callback' => 'dsg_ebook_render_projects_chapter',
		)
	);
	register_block_type(
		__DIR__ . '/blocks/essays-chapter',
		array(
			'render_callback' => 'dsg_ebook_render_essays_chapter',
		)
	);
}
add_action( 'init', 'dsg_ebook_register_blocks' );

/**
 * Server-side block previews run through REST in the editor. Frontend missing
 * sources should fail quiet, while editor previews should explain what to fix.
 */
function dsg_ebook_is_editor_preview_request() {
	return is_admin() || ( defined( 'REST_REQUEST' ) && REST_REQUEST );
}

/**
 * Render a small editor-facing block notice for dynamic block fallbacks.
 */
function dsg_ebook_render_editor_block_notice( $heading, $message ) {
	if ( ! dsg_ebook_is_editor_preview_request() ) {
		return '';
	}

	ob_start();
	?>
	<div class="dsg-editor-block-placeholder">
		<strong><?php echo esc_html( $heading ); ?></strong>
		<p><?php echo esc_html( $message ); ?></p>
	</div>
	<?php
	return ob_get_clean();
}

/**
 * Render the fixed reader header chrome.
 */
function dsg_ebook_render_reader_header( $attributes ) {
	$site_label           = isset( $attributes['siteLabel'] ) && '' !== $attributes['siteLabel'] ? $attributes['siteLabel'] : get_bloginfo( 'name' );
	$site_href            = isset( $attributes['siteHref'] ) && '' !== $attributes['siteHref'] ? $attributes['siteHref'] : home_url( '/' );
	$show_reader_settings = ! array_key_exists( 'showReaderSettings', $attributes ) || ! empty( $attributes['showReaderSettings'] );
	$nav_items            = dsg_ebook_normalize_nav_items(
		isset( $attributes['navItems'] ) && is_array( $attributes['navItems'] ) ? $attributes['navItems'] : array(
			array(
				'label' => 'Contents',
				'href'  => '/#contents',
			),
			array(
				'label' => 'Works',
				'href'  => '/#works',
			),
			array(
				'label' => 'Essays',
				'href'  => '/#essays',
			),
		)
	);

	ob_start();
	?>
	<div class="wp-block-dsg-reader-header wp-block-group dsg-bar dsg-top">
		<div class="dsg-top-inner">
			<a class="dsg-site-mark" href="<?php echo esc_url( $site_href ); ?>"><?php echo esc_html( $site_label ); ?></a>
			<?php if ( ! empty( $nav_items ) ) : ?>
				<nav class="dsg-section-nav" aria-label="Sections">
					<?php foreach ( $nav_items as $item ) : ?>
						<a href="<?php echo esc_url( $item['href'] ); ?>"><?php echo esc_html( $item['label'] ); ?></a>
					<?php endforeach; ?>
				</nav>
			<?php endif; ?>
			<div class="dsg-top-actions">
				<?php if ( $show_reader_settings ) : ?>
					<button class="dsg-reader-trigger" type="button" id="dsg-reader-trigger" aria-label="Reader settings" aria-expanded="false" aria-controls="dsg-reader-panel">A<span>a</span></button>
					<div class="dsg-reader-panel" id="dsg-reader-panel" role="dialog" aria-label="Reader settings" aria-hidden="true">
						<div class="dsg-reader-row">
							<div class="dsg-reader-label">Text size</div>
							<div class="dsg-reader-stepper">
								<button class="dsg-reader-btn dsg-type-smaller" type="button" id="dsg-type-dec" aria-label="Decrease text size">A</button>
								<span class="dsg-type-status" id="dsg-type-status" aria-live="polite">100%</span>
								<button class="dsg-reader-btn dsg-type-larger" type="button" id="dsg-type-inc" aria-label="Increase text size">A</button>
							</div>
						</div>
						<div class="dsg-reader-row">
							<div class="dsg-reader-label">Font</div>
							<div class="dsg-reader-choices dsg-reader-fonts" id="dsg-font-choices" aria-label="Reader font">
								<button class="dsg-reader-choice dsg-font-serif" type="button" data-reader-font="serif" aria-pressed="true">Serif</button>
								<button class="dsg-reader-choice dsg-font-sans" type="button" data-reader-font="sans" aria-pressed="false">Sans</button>
								<button class="dsg-reader-choice dsg-font-mono" type="button" data-reader-font="mono" aria-pressed="false">Mono</button>
							</div>
						</div>
						<div class="dsg-reader-row">
							<div class="dsg-reader-label">Page width</div>
							<div class="dsg-reader-choices dsg-reader-widths" id="dsg-width-choices" aria-label="Reader page width">
								<button class="dsg-reader-choice" type="button" data-reader-width="narrow" aria-pressed="false">Narrow</button>
								<button class="dsg-reader-choice" type="button" data-reader-width="standard" aria-pressed="true">Default</button>
								<button class="dsg-reader-choice" type="button" data-reader-width="wide" aria-pressed="false">Wide</button>
							</div>
						</div>
						<div class="dsg-reader-row">
							<div class="dsg-reader-label">Line height</div>
							<div class="dsg-reader-choices dsg-reader-leading" id="dsg-leading-choices" aria-label="Reader line height">
								<button class="dsg-reader-choice" type="button" data-reader-leading="tight" aria-pressed="false">Tight</button>
								<button class="dsg-reader-choice" type="button" data-reader-leading="standard" aria-pressed="true">Normal</button>
								<button class="dsg-reader-choice" type="button" data-reader-leading="loose" aria-pressed="false">Loose</button>
							</div>
						</div>
						<div class="dsg-reader-row">
							<div class="dsg-reader-label">Theme</div>
							<div class="dsg-reader-choices dsg-reader-themes" id="dsg-theme-choices" aria-label="Reader theme">
								<button class="dsg-reader-choice" type="button" data-reader-theme="light" aria-pressed="true">Light</button>
								<button class="dsg-reader-choice" type="button" data-reader-theme="dark" aria-pressed="false">Dark</button>
							</div>
						</div>
					</div>
				<?php endif; ?>
			</div>
		</div>
	</div>
	<?php
	return ob_get_clean();
}

/**
 * Render the fixed reader footer progress chrome.
 */
function dsg_ebook_render_reader_footer( $attributes ) {
	$initial_percent = isset( $attributes['initialPercent'] ) && '' !== $attributes['initialPercent'] ? $attributes['initialPercent'] : '0%';
	$initial_time    = isset( $attributes['initialTimeLeft'] ) && '' !== $attributes['initialTimeLeft'] ? $attributes['initialTimeLeft'] : 'reading progress';

	ob_start();
	?>
	<div class="wp-block-dsg-reader-footer wp-block-group dsg-bar dsg-bottom">
		<div class="dsg-footer-inner">
			<span class="dsg-progress-pct" id="dsg-pct"><?php echo esc_html( $initial_percent ); ?></span>
			<div class="dsg-progress" aria-hidden="true"><div class="dsg-progress-fill" id="dsg-fill"></div></div>
			<span class="dsg-time-left" id="dsg-time-left"><?php echo esc_html( $initial_time ); ?></span>
		</div>
	</div>
	<?php
	return ob_get_clean();
}

/**
 * Render previous/next essay links in the same oldest-first chapter order used
 * by the chapter-number block.
 */
function dsg_ebook_render_essay_navigation( $attributes ) {
	if ( ! is_singular( 'post' ) ) {
		return dsg_ebook_render_editor_block_notice(
			'Essay Navigation',
			'This block renders previous and next essay links on single Posts.'
		);
	}

	$current_id     = get_the_ID();
	$neighbors      = dsg_ebook_essay_neighbors( $current_id );
	$show_back_link = ! array_key_exists( 'showBackLink', $attributes ) || ! empty( $attributes['showBackLink'] );
	$back_label     = isset( $attributes['backLabel'] ) && '' !== $attributes['backLabel'] ? $attributes['backLabel'] : 'All essays';
	$back_href      = isset( $attributes['backHref'] ) && '' !== $attributes['backHref'] ? $attributes['backHref'] : '/#essays';

	if ( empty( $neighbors['previous'] ) && empty( $neighbors['next'] ) && ! $show_back_link ) {
		return '';
	}

	ob_start();
	?>
	<nav class="wp-block-dsg-essay-navigation dsg-essay-nav" aria-label="Essay navigation">
		<div class="dsg-essay-nav-grid">
			<?php echo dsg_ebook_render_essay_nav_link( $neighbors['previous'], 'Previous chapter', 'dsg-essay-nav-prev' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?php if ( $show_back_link ) : ?>
				<a class="dsg-essay-nav-index" href="<?php echo esc_url( $back_href ); ?>"><?php echo esc_html( $back_label ); ?></a>
			<?php else : ?>
				<span class="dsg-essay-nav-index" aria-hidden="true"></span>
			<?php endif; ?>
			<?php echo dsg_ebook_render_essay_nav_link( $neighbors['next'], 'Next chapter', 'dsg-essay-nav-next' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		</div>
	</nav>
	<?php
	return ob_get_clean();
}

/**
 * Return previous and next posts in oldest-first chapter order.
 */
function dsg_ebook_essay_neighbors( $post_id ) {
	$ids   = dsg_ebook_essay_chapter_ids();
	$index = array_search( (int) $post_id, $ids, true );

	if ( false === $index ) {
		return array(
			'previous' => null,
			'next'     => null,
		);
	}

	return array(
		'previous' => $index > 0 ? get_post( $ids[ $index - 1 ] ) : null,
		'next'     => $index < count( $ids ) - 1 ? get_post( $ids[ $index + 1 ] ) : null,
	);
}

/**
 * Shared ordered essay ID list for chapter numbering and navigation.
 */
function dsg_ebook_essay_chapter_ids() {
	static $ids = null;
	if ( null === $ids ) {
		$ids = get_posts(
			array(
				'post_type'      => 'post',
				'post_status'    => 'publish',
				'posts_per_page' => -1,
				'orderby'        => 'date',
				'order'          => 'ASC',
				'fields'         => 'ids',
			)
		);
		$ids = array_map( 'intval', $ids );
	}

	return $ids;
}

/**
 * Render one navigation link, or a quiet endpoint marker when absent.
 */
function dsg_ebook_render_essay_nav_link( $post, $label, $class_name ) {
	if ( ! $post ) {
		return '<span class="dsg-essay-nav-link ' . esc_attr( $class_name ) . ' is-empty" aria-hidden="true"></span>';
	}

	$chapter = dsg_ebook_chapter_position( $post->ID );
	$meta    = $chapter ? 'Chapter ' . dsg_ebook_number_word( $chapter ) : get_the_date( 'M Y', $post );

	ob_start();
	?>
	<a class="dsg-essay-nav-link <?php echo esc_attr( $class_name ); ?>" href="<?php echo esc_url( get_permalink( $post ) ); ?>">
		<span class="dsg-essay-nav-label"><?php echo esc_html( $label ); ?></span>
		<span class="dsg-essay-nav-title"><?php echo esc_html( get_the_title( $post ) ); ?></span>
		<span class="dsg-essay-nav-meta"><?php echo esc_html( $meta ); ?></span>
	</a>
	<?php
	return ob_get_clean();
}

/**
 * Render the homepage book-cover block.
 */
function dsg_ebook_render_book_cover( $attributes ) {
	$edition          = isset( $attributes['edition'] ) ? $attributes['edition'] : 'Digital Edition · 2026 · Self-Published';
	$title            = isset( $attributes['title'] ) && '' !== $attributes['title'] ? $attributes['title'] : "Collected\nWorks";
	$use_site_tagline = ! array_key_exists( 'useSiteTagline', $attributes ) || ! empty( $attributes['useSiteTagline'] );
	$subtitle         = $use_site_tagline ? get_bloginfo( 'description' ) : ( isset( $attributes['subtitle'] ) ? $attributes['subtitle'] : '' );
	$author_label     = isset( $attributes['authorLabel'] ) ? $attributes['authorLabel'] : 'written by';
	$author_name      = isset( $attributes['authorName'] ) ? $attributes['authorName'] : 'DEREK SMART-GORDON';
	$meta_items       = dsg_ebook_normalize_text_items(
		isset( $attributes['metaItems'] ) && is_array( $attributes['metaItems'] ) ? $attributes['metaItems'] : array(
			'essays & projects',
			'selected works',
			'assembled in Portland, Maine',
		)
	);
	$title_lines      = array_filter(
		array_map( 'trim', preg_split( '/\R/', $title ) ),
		function ( $line ) {
			return '' !== $line;
		}
	);

	if ( empty( $title_lines ) ) {
		$title_lines = array( get_bloginfo( 'name' ) );
	}

	$title_html = implode( '<br>', array_map( 'esc_html', $title_lines ) );

	ob_start();
	?>
	<section class="wp-block-dsg-book-cover wp-block-group dsg-cover">
		<?php if ( '' !== $edition ) : ?>
			<p class="has-text-align-center dsg-cover-pub"><?php echo esc_html( $edition ); ?></p>
		<?php endif; ?>

		<h1 class="wp-block-heading has-text-align-center dsg-cover-title"><?php echo $title_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></h1>

		<?php if ( '' !== $subtitle ) : ?>
			<p class="has-text-align-center dsg-cover-subtitle"><?php echo esc_html( $subtitle ); ?></p>
		<?php endif; ?>

		<?php if ( '' !== $author_label || '' !== $author_name ) : ?>
			<p class="has-text-align-center dsg-cover-author">
				<?php echo esc_html( $author_label ); ?>
				<?php if ( '' !== $author_name ) : ?>
					<br><strong><?php echo esc_html( $author_name ); ?></strong>
				<?php endif; ?>
			</p>
		<?php endif; ?>

		<?php if ( ! empty( $meta_items ) ) : ?>
			<div class="dsg-cover-meta">
				<?php foreach ( $meta_items as $item ) : ?>
					<span><?php echo esc_html( $item ); ?></span>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>
	</section>
	<?php
	return ob_get_clean();
}

/**
 * Render the homepage contents block.
 */
function dsg_ebook_render_contents( $attributes ) {
	$id      = isset( $attributes['id'] ) && '' !== $attributes['id'] ? sanitize_title( $attributes['id'] ) : 'contents';
	$heading = isset( $attributes['heading'] ) && '' !== $attributes['heading'] ? $attributes['heading'] : 'Contents';
	$items   = dsg_ebook_normalize_contents_items(
		isset( $attributes['items'] ) && is_array( $attributes['items'] ) ? $attributes['items'] : array()
	);

	if ( empty( $items ) ) {
		return dsg_ebook_render_editor_block_notice(
			'Contents',
			'Add at least one contents row in the block settings.'
		);
	}

	ob_start();
	?>
	<nav id="<?php echo esc_attr( $id ); ?>" class="wp-block-dsg-contents wp-block-group dsg-toc" aria-label="<?php echo esc_attr( $heading ); ?>">
		<h2 class="wp-block-heading has-text-align-center dsg-toc-heading"><?php echo esc_html( $heading ); ?></h2>
		<ul class="dsg-toc-list">
			<?php foreach ( $items as $item ) : ?>
				<li>
					<?php if ( '' !== $item['label'] ) : ?>
						<span class="dsg-toc-roman"><?php echo esc_html( $item['label'] ); ?></span>
					<?php endif; ?>

					<?php if ( '' !== $item['href'] ) : ?>
						<a class="dsg-toc-name" href="<?php echo esc_url( $item['href'] ); ?>">
							<?php echo esc_html( $item['title'] ); ?>
							<?php if ( '' !== $item['subtitle'] ) : ?>
								<small><?php echo esc_html( $item['subtitle'] ); ?></small>
							<?php endif; ?>
						</a>
					<?php else : ?>
						<span class="dsg-toc-name">
							<?php echo esc_html( $item['title'] ); ?>
							<?php if ( '' !== $item['subtitle'] ) : ?>
								<small><?php echo esc_html( $item['subtitle'] ); ?></small>
							<?php endif; ?>
						</span>
					<?php endif; ?>

					<?php if ( '' !== $item['marker'] ) : ?>
						<span class="dsg-toc-pct"><?php echo esc_html( $item['marker'] ); ?></span>
					<?php endif; ?>
				</li>
			<?php endforeach; ?>
		</ul>
	</nav>
	<?php
	return ob_get_clean();
}

/**
 * Normalize a list of text values from block attributes.
 */
function dsg_ebook_normalize_text_items( $items ) {
	return array_values(
		array_filter(
			array_map(
				function ( $item ) {
					return is_scalar( $item ) ? trim( (string) $item ) : '';
				},
				$items
			),
			function ( $item ) {
				return '' !== $item;
			}
		)
	);
}

/**
 * Normalize contents rows from block attributes.
 */
function dsg_ebook_normalize_contents_items( $items ) {
	$normalized = array();

	foreach ( $items as $item ) {
		if ( ! is_array( $item ) ) {
			continue;
		}

		$title = isset( $item['title'] ) ? trim( (string) $item['title'] ) : '';
		if ( '' === $title ) {
			continue;
		}

		$normalized[] = array(
			'label'    => isset( $item['label'] ) ? trim( (string) $item['label'] ) : '',
			'href'     => isset( $item['href'] ) ? trim( (string) $item['href'] ) : '',
			'title'    => $title,
			'subtitle' => isset( $item['subtitle'] ) ? trim( (string) $item['subtitle'] ) : '',
			'marker'   => isset( $item['marker'] ) ? trim( (string) $item['marker'] ) : '',
		);
	}

	return $normalized;
}

/**
 * Normalize header nav rows from block attributes.
 */
function dsg_ebook_normalize_nav_items( $items ) {
	$normalized = array();

	foreach ( $items as $item ) {
		if ( ! is_array( $item ) ) {
			continue;
		}

		$label = isset( $item['label'] ) ? trim( (string) $item['label'] ) : '';
		$href  = isset( $item['href'] ) ? trim( (string) $item['href'] ) : '';
		if ( '' === $label || '' === $href ) {
			continue;
		}

		$normalized[] = array(
			'label' => $label,
			'href'  => $href,
		);
	}

	return $normalized;
}

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
		return dsg_ebook_render_editor_block_notice(
			'Page Chapter',
			'Choose a source page in the block settings.'
		);
	}

	$page = get_page_by_path( $slug );
	if ( ! $page || 'publish' !== get_post_status( $page ) ) {
		return dsg_ebook_render_editor_block_notice(
			'Page Chapter',
			sprintf( 'No published page found for the "%s" slug.', $slug )
		);
	}

	$id            = isset( $attributes['id'] ) && '' !== $attributes['id'] ? sanitize_title( $attributes['id'] ) : $slug;
	$chapter       = isset( $attributes['chapter'] ) ? $attributes['chapter'] : '';
	$title         = isset( $attributes['title'] ) && '' !== $attributes['title'] ? $attributes['title'] : get_the_title( $page );
	$dek           = isset( $attributes['dek'] ) ? $attributes['dek'] : '';
	$dropcap       = ! empty( $attributes['dropcap'] );
	$show_ornament = ! array_key_exists( 'showOrnament', $attributes ) || ! empty( $attributes['showOrnament'] );

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
		<?php if ( $show_ornament ) : ?>
			<div class="dsg-ornament" aria-hidden="true">· · ·</div>
		<?php endif; ?>
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
	if ( '' === $slug ) {
		return dsg_ebook_render_editor_block_notice(
			'Projects Chapter',
			'Choose the temporary Projects source page in the block settings.'
		);
	}

	$page = get_page_by_path( $slug );
	if ( ! $page || 'publish' !== get_post_status( $page ) ) {
		return dsg_ebook_render_editor_block_notice(
			'Projects Chapter',
			sprintf( 'No published page found for the "%s" slug.', $slug )
		);
	}

	$id            = isset( $attributes['id'] ) && '' !== $attributes['id'] ? sanitize_title( $attributes['id'] ) : 'works';
	$chapter       = isset( $attributes['chapter'] ) ? $attributes['chapter'] : '';
	$title         = isset( $attributes['title'] ) && '' !== $attributes['title'] ? $attributes['title'] : get_the_title( $page );
	$dek           = isset( $attributes['dek'] ) ? $attributes['dek'] : '';
	$show_intro    = ! array_key_exists( 'showIntro', $attributes ) || ! empty( $attributes['showIntro'] );
	$show_ornament = ! array_key_exists( 'showOrnament', $attributes ) || ! empty( $attributes['showOrnament'] );
	$outline       = dsg_ebook_project_outline_from_page( $page );

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
		<?php if ( $show_intro && '' !== $outline['intro'] ) : ?>
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
		<?php if ( $show_ornament ) : ?>
			<div class="dsg-ornament" aria-hidden="true">· · ·</div>
		<?php endif; ?>
	</section>
	<?php
	return ob_get_clean();
}

/**
 * Render recent Posts as the homepage Essays chapter.
 */
function dsg_ebook_render_essays_chapter( $attributes ) {
	$id            = isset( $attributes['id'] ) && '' !== $attributes['id'] ? sanitize_title( $attributes['id'] ) : 'essays';
	$chapter       = isset( $attributes['chapter'] ) ? $attributes['chapter'] : 'Chapter Three';
	$title         = isset( $attributes['title'] ) && '' !== $attributes['title'] ? $attributes['title'] : 'Essays';
	$dek           = isset( $attributes['dek'] ) ? $attributes['dek'] : '';
	$per_page      = isset( $attributes['perPage'] ) ? max( 1, min( 20, absint( $attributes['perPage'] ) ) ) : 5;
	$order         = isset( $attributes['order'] ) && 'asc' === strtolower( $attributes['order'] ) ? 'ASC' : 'DESC';
	$order_by      = isset( $attributes['orderBy'] ) ? sanitize_key( $attributes['orderBy'] ) : 'date';
	$date_format   = isset( $attributes['dateFormat'] ) && '' !== $attributes['dateFormat'] ? $attributes['dateFormat'] : 'M Y';
	$empty_text    = isset( $attributes['emptyText'] ) ? $attributes['emptyText'] : 'No essays yet — watch this space.';
	$show_dates    = ! array_key_exists( 'showDates', $attributes ) || ! empty( $attributes['showDates'] );
	$show_ornament = ! empty( $attributes['showOrnament'] );
	$allowed_order = array( 'date', 'title', 'menu_order' );

	if ( ! in_array( $order_by, $allowed_order, true ) ) {
		$order_by = 'date';
	}

	$essays = new WP_Query(
		array(
			'post_type'           => 'post',
			'post_status'         => 'publish',
			'posts_per_page'      => $per_page,
			'orderby'             => $order_by,
			'order'               => $order,
			'ignore_sticky_posts' => true,
		)
	);

	ob_start();
	?>
	<section id="<?php echo esc_attr( $id ); ?>" class="dsg-chapter dsg-essays-chapter">
		<?php if ( '' !== $chapter ) : ?>
			<div class="dsg-chapter-num"><?php echo esc_html( $chapter ); ?></div>
		<?php endif; ?>
		<h2 class="dsg-chapter-title has-text-align-center"><?php echo esc_html( $title ); ?></h2>
		<?php if ( '' !== $dek ) : ?>
			<p class="dsg-chapter-dek has-text-align-center"><?php echo esc_html( $dek ); ?></p>
		<?php endif; ?>
		<?php if ( $essays->have_posts() ) : ?>
			<div class="dsg-essays">
					<?php while ( $essays->have_posts() ) : ?>
						<?php $essays->the_post(); ?>
						<article class="dsg-essay-row">
							<h3 class="dsg-essay-title">
								<a href="<?php echo esc_url( get_permalink() ); ?>"><?php echo esc_html( get_the_title() ); ?></a>
							</h3>
						<?php if ( $show_dates ) : ?>
							<time class="dsg-essay-date" datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><?php echo esc_html( get_the_date( $date_format ) ); ?></time>
						<?php endif; ?>
					</article>
				<?php endwhile; ?>
			</div>
		<?php elseif ( '' !== $empty_text ) : ?>
			<p class="has-text-align-center dsg-essay-empty"><?php echo esc_html( $empty_text ); ?></p>
		<?php endif; ?>
		<?php if ( $show_ornament ) : ?>
			<div class="dsg-ornament" aria-hidden="true">· · ·</div>
		<?php endif; ?>
	</section>
	<?php
	wp_reset_postdata();
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
		$ids   = dsg_ebook_essay_chapter_ids();
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
