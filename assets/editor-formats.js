/**
 * DSG Ebook — editor-formats.js
 *
 * Registers three inline formats for the rich-text toolbar so authors can
 * highlight, define, and footnote text the same way they bold or italicize:
 *
 *   - dsg/highlight  → <mark class="dsg-highlight" data-readers="N">…</mark>
 *   - dsg/define     → <span class="dsg-define" data-def="…" data-pron="…">…</span>
 *   - dsg/footnote   → <span class="dsg-footnote-marker" data-fn-text="…">…</span>
 *
 * The text inside the footnote span is replaced with an auto-numbered marker
 * at render time by reader.js, so authors can wrap any phrase they like.
 */
( function ( wp ) {
	if ( ! wp || ! wp.richText || ! wp.element || ! wp.blockEditor ) {
		return;
	}

	var el = wp.element.createElement;
	var registerFormatType = wp.richText.registerFormatType;
	var applyFormat = wp.richText.applyFormat;
	var removeFormat = wp.richText.removeFormat;
	var RichTextToolbarButton = wp.blockEditor.RichTextToolbarButton;

	registerFormatType( 'dsg/highlight', {
		title: 'Highlight (e-reader)',
		tagName: 'mark',
		className: 'dsg-highlight',
		attributes: { readers: 'data-readers' },
		edit: function ( props ) {
			return el( RichTextToolbarButton, {
				icon: 'admin-customizer',
				title: 'Highlight',
				isActive: props.isActive,
				onClick: function () {
					if ( props.isActive ) {
						props.onChange( removeFormat( props.value, 'dsg/highlight' ) );
						return;
					}
					var input = window.prompt(
						'How many readers also highlighted this? (optional, blank for none)',
						''
					);
					var attrs = {};
					if ( input && /^\d+$/.test( input ) ) {
						attrs.readers = input;
					}
					props.onChange(
						applyFormat( props.value, {
							type: 'dsg/highlight',
							attributes: attrs,
						} )
					);
				},
			} );
		},
	} );

	registerFormatType( 'dsg/define', {
		title: 'Define (e-reader)',
		tagName: 'span',
		className: 'dsg-define',
		attributes: {
			definition: 'data-def',
			pronunciation: 'data-pron',
		},
		edit: function ( props ) {
			return el( RichTextToolbarButton, {
				icon: 'editor-spellcheck',
				title: 'Define',
				isActive: props.isActive,
				onClick: function () {
					if ( props.isActive ) {
						props.onChange( removeFormat( props.value, 'dsg/define' ) );
						return;
					}
					var def = window.prompt( 'Definition:' );
					if ( ! def ) {
						return;
					}
					var pron = window.prompt( 'Pronunciation (optional):', '' ) || '';
					var attrs = { definition: def };
					if ( pron ) {
						attrs.pronunciation = pron;
					}
					props.onChange(
						applyFormat( props.value, {
							type: 'dsg/define',
							attributes: attrs,
						} )
					);
				},
			} );
		},
	} );

	registerFormatType( 'dsg/footnote', {
		title: 'Footnote (e-reader)',
		tagName: 'span',
		className: 'dsg-footnote-marker',
		attributes: { note: 'data-fn-text' },
		edit: function ( props ) {
			return el( RichTextToolbarButton, {
				icon: 'editor-quote',
				title: 'Footnote',
				isActive: props.isActive,
				onClick: function () {
					if ( props.isActive ) {
						props.onChange( removeFormat( props.value, 'dsg/footnote' ) );
						return;
					}
					var note = window.prompt( 'Footnote text:' );
					if ( ! note ) {
						return;
					}
					props.onChange(
						applyFormat( props.value, {
							type: 'dsg/footnote',
							attributes: { note: note },
						} )
					);
				},
			} );
		},
	} );
} )( window.wp );
