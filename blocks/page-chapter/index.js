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
	var SelectControl = wp.components.SelectControl;
	var TextControl = wp.components.TextControl;
	var ToggleControl = wp.components.ToggleControl;
	var ServerSideRender = wp.serverSideRender.default || wp.serverSideRender;
	var decodeEntities = wp.htmlEntities.decodeEntities;
	var useSelect = wp.data.useSelect;
	var pageQuery = {
		per_page: 100,
		orderby: 'title',
		order: 'asc',
	};

	function pageOptions( pages ) {
		var options = [
			{
				label: __( 'Select a page', 'dsg-ereader' ),
				value: '',
			},
		];

		if ( ! pages ) {
			options.push( {
				label: __( 'Loading pages...', 'dsg-ereader' ),
				value: '',
				disabled: true,
			} );
			return options;
		}

		pages.forEach( function ( page ) {
			var title = page.title && page.title.rendered ? decodeEntities( page.title.rendered ) : __( '(untitled)', 'dsg-ereader' );
			options.push( {
				label: title + ' /' + page.slug + '/',
				value: page.slug,
			} );
		} );

		return options;
	}

	function PageControls( props ) {
		var attributes = props.attributes;
		var setAttributes = props.setAttributes;
		var pages = useSelect( function ( select ) {
			return select( 'core' ).getEntityRecords( 'postType', 'page', pageQuery );
		}, [] );

		return el(
			InspectorControls,
			null,
			el(
				PanelBody,
				{
					title: __( 'Source', 'dsg-ereader' ),
					initialOpen: true,
				},
				el( SelectControl, {
					label: __( 'Source page', 'dsg-ereader' ),
					value: attributes.slug || '',
					options: pageOptions( pages ),
					onChange: function ( value ) {
						setAttributes( { slug: value } );
					},
				} ),
				el( TextControl, {
					label: __( 'Source slug', 'dsg-ereader' ),
					help: __( 'Use this when the page is not listed yet. The frontend reads the published page with this slug.', 'dsg-ereader' ),
					value: attributes.slug || '',
					onChange: function ( value ) {
						setAttributes( { slug: value } );
					},
				} )
			),
			el(
				PanelBody,
				{
					title: __( 'Chapter copy', 'dsg-ereader' ),
					initialOpen: true,
				},
				el( TextControl, {
					label: __( 'Anchor ID', 'dsg-ereader' ),
					help: __( 'Used for the table of contents link. Defaults to the source slug.', 'dsg-ereader' ),
					value: attributes.id || '',
					onChange: function ( value ) {
						setAttributes( { id: value } );
					},
				} ),
				el( TextControl, {
					label: __( 'Chapter label', 'dsg-ereader' ),
					placeholder: __( 'Chapter One', 'dsg-ereader' ),
					value: attributes.chapter || '',
					onChange: function ( value ) {
						setAttributes( { chapter: value } );
					},
				} ),
				el( TextControl, {
					label: __( 'Heading', 'dsg-ereader' ),
					help: __( 'Leave blank to use the page title.', 'dsg-ereader' ),
					value: attributes.title || '',
					onChange: function ( value ) {
						setAttributes( { title: value } );
					},
				} ),
				el( TextControl, {
					label: __( 'Subtitle', 'dsg-ereader' ),
					value: attributes.dek || '',
					onChange: function ( value ) {
						setAttributes( { dek: value } );
					},
				} )
			),
			el(
				PanelBody,
				{
					title: __( 'Display', 'dsg-ereader' ),
					initialOpen: false,
				},
				el( ToggleControl, {
					label: __( 'Drop cap first paragraph', 'dsg-ereader' ),
					checked: !! attributes.dropcap,
					onChange: function ( value ) {
						setAttributes( { dropcap: value } );
					},
				} ),
				el( ToggleControl, {
					label: __( 'Show closing ornament', 'dsg-ereader' ),
					checked: attributes.showOrnament !== false,
					onChange: function ( value ) {
						setAttributes( { showOrnament: value } );
					},
				} )
			)
		);
	}

	function Edit( props ) {
		var blockProps = useBlockProps( {
			className: 'dsg-page-chapter-editor-preview',
		} );

		return el(
			'div',
			blockProps,
			el( PageControls, props ),
			el( ServerSideRender, {
				block: 'dsg/page-chapter',
				attributes: props.attributes,
			} )
		);
	}

	registerBlockType( 'dsg/page-chapter', {
		title: __( 'Page Chapter', 'dsg-ereader' ),
		description: __( 'Render a selected Page as an ereader chapter.', 'dsg-ereader' ),
		category: 'theme',
		icon: 'book',
		attributes: {
			slug: {
				type: 'string',
				default: '',
			},
			id: {
				type: 'string',
				default: '',
			},
			chapter: {
				type: 'string',
				default: '',
			},
			title: {
				type: 'string',
				default: '',
			},
			dek: {
				type: 'string',
				default: '',
			},
			dropcap: {
				type: 'boolean',
				default: false,
			},
			showOrnament: {
				type: 'boolean',
				default: true,
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
