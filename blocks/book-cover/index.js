( function ( wp ) {
	if (
		! wp ||
		! wp.blocks ||
		! wp.blockEditor ||
		! wp.components ||
		! wp.element ||
		! wp.serverSideRender
	) {
		return;
	}

	var el = wp.element.createElement;
	var __ = wp.i18n.__;
	var registerBlockType = wp.blocks.registerBlockType;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var PanelBody = wp.components.PanelBody;
	var TextareaControl = wp.components.TextareaControl;
	var TextControl = wp.components.TextControl;
	var ToggleControl = wp.components.ToggleControl;
	var ServerSideRender = wp.serverSideRender.default || wp.serverSideRender;

	function metaItemsToText( items ) {
		return Array.isArray( items ) ? items.join( '\n' ) : '';
	}

	function textToMetaItems( value ) {
		return value
			.split( '\n' )
			.map( function ( item ) {
				return item.trim();
			} )
			.filter( Boolean );
	}

	function BookCoverControls( props ) {
		var attributes = props.attributes;
		var setAttributes = props.setAttributes;

		return el(
			InspectorControls,
			null,
			el(
				PanelBody,
				{
					title: __( 'Cover copy', 'dsg-ereader' ),
					initialOpen: true,
				},
				el( TextControl, {
					label: __( 'Edition line', 'dsg-ereader' ),
					value: attributes.edition || '',
					onChange: function ( value ) {
						setAttributes( { edition: value } );
					},
				} ),
				el( TextareaControl, {
					label: __( 'Title', 'dsg-ereader' ),
					help: __( 'Use line breaks where the cover title should break.', 'dsg-ereader' ),
					value: attributes.title || '',
					onChange: function ( value ) {
						setAttributes( { title: value } );
					},
				} ),
				el( ToggleControl, {
					label: __( 'Use site tagline as subtitle', 'dsg-ereader' ),
					checked: attributes.useSiteTagline !== false,
					onChange: function ( value ) {
						setAttributes( { useSiteTagline: value } );
					},
				} ),
				attributes.useSiteTagline === false &&
					el( TextControl, {
						label: __( 'Subtitle', 'dsg-ereader' ),
						value: attributes.subtitle || '',
						onChange: function ( value ) {
							setAttributes( { subtitle: value } );
						},
					} )
			),
			el(
				PanelBody,
				{
					title: __( 'Author', 'dsg-ereader' ),
					initialOpen: false,
				},
				el( TextControl, {
					label: __( 'Author label', 'dsg-ereader' ),
					value: attributes.authorLabel || '',
					onChange: function ( value ) {
						setAttributes( { authorLabel: value } );
					},
				} ),
				el( TextControl, {
					label: __( 'Author name', 'dsg-ereader' ),
					value: attributes.authorName || '',
					onChange: function ( value ) {
						setAttributes( { authorName: value } );
					},
				} )
			),
			el(
				PanelBody,
				{
					title: __( 'Metadata row', 'dsg-ereader' ),
					initialOpen: false,
				},
				el( TextareaControl, {
					label: __( 'Metadata items', 'dsg-ereader' ),
					help: __( 'One item per line.', 'dsg-ereader' ),
					value: metaItemsToText( attributes.metaItems ),
					onChange: function ( value ) {
						setAttributes( { metaItems: textToMetaItems( value ) } );
					},
				} )
			)
		);
	}

	function Edit( props ) {
		var blockProps = useBlockProps( {
			className: 'dsg-book-cover-editor-preview',
		} );

		return el(
			'div',
			blockProps,
			el( BookCoverControls, props ),
			el( ServerSideRender, {
				block: 'dsg/book-cover',
				attributes: props.attributes,
			} )
		);
	}

	registerBlockType( 'dsg/book-cover', {
		title: __( 'Book Cover', 'dsg-ereader' ),
		description: __( 'Render the homepage cover as an ereader book cover.', 'dsg-ereader' ),
		category: 'theme',
		icon: 'book-alt',
		attributes: {
			edition: {
				type: 'string',
				default: 'Digital Edition · 2026 · Self-Published',
			},
			title: {
				type: 'string',
				default: 'Collected\nWorks',
			},
			useSiteTagline: {
				type: 'boolean',
				default: true,
			},
			subtitle: {
				type: 'string',
				default: '',
			},
			authorLabel: {
				type: 'string',
				default: 'written by',
			},
			authorName: {
				type: 'string',
				default: 'DEREK SMART-GORDON',
			},
			metaItems: {
				type: 'array',
				default: [
					'essays & projects',
					'selected works',
					'assembled in Portland, Maine',
				],
			},
		},
		supports: {
			html: false,
			anchor: false,
			align: false,
		},
		edit: Edit,
		save: function () {
			return null;
		},
	} );
} )( window.wp );
