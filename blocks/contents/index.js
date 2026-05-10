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
	var Button = wp.components.Button;
	var PanelBody = wp.components.PanelBody;
	var TextControl = wp.components.TextControl;
	var ServerSideRender = wp.serverSideRender.default || wp.serverSideRender;
	var defaultItems = [
		{
			label: 'i.',
			href: '#about',
			title: 'About the Author',
			subtitle: 'a short, mostly accurate biography',
			marker: 'page',
		},
		{
			label: 'ii.',
			href: '#works',
			title: 'Selected Works',
			subtitle: 'projects worth pointing at',
			marker: 'page',
		},
		{
			label: 'iii.',
			href: '#essays',
			title: 'Essays',
			subtitle: 'occasional writing, in reverse chronological',
			marker: 'posts',
		},
		{
			label: 'iv.',
			href: '#coda',
			title: 'Coda',
			subtitle: 'where to find me, how to get in touch',
			marker: 'end',
		},
	];

	function normalizeItems( items ) {
		return Array.isArray( items ) ? items : defaultItems;
	}

	function updateItem( items, index, key, value ) {
		return items.map( function ( item, itemIndex ) {
			if ( itemIndex !== index ) {
				return item;
			}
			return Object.assign( {}, item, {
				[ key ]: value,
			} );
		} );
	}

	function ContentsControls( props ) {
		var attributes = props.attributes;
		var setAttributes = props.setAttributes;
		var items = normalizeItems( attributes.items );

		return el(
			InspectorControls,
			null,
			el(
				PanelBody,
				{
					title: __( 'Contents heading', 'dsg-ereader' ),
					initialOpen: true,
				},
				el( TextControl, {
					label: __( 'Anchor ID', 'dsg-ereader' ),
					value: attributes.id || '',
					onChange: function ( value ) {
						setAttributes( { id: value } );
					},
				} ),
				el( TextControl, {
					label: __( 'Heading', 'dsg-ereader' ),
					value: attributes.heading || '',
					onChange: function ( value ) {
						setAttributes( { heading: value } );
					},
				} )
			),
			el(
				PanelBody,
				{
					title: __( 'Rows', 'dsg-ereader' ),
					initialOpen: true,
				},
				items.map( function ( item, index ) {
					return el(
						'div',
						{
							className: 'dsg-contents-row-controls',
							key: index,
						},
						el( TextControl, {
							label: __( 'Label', 'dsg-ereader' ),
							value: item.label || '',
							onChange: function ( value ) {
								setAttributes( {
									items: updateItem( items, index, 'label', value ),
								} );
							},
						} ),
						el( TextControl, {
							label: __( 'Link', 'dsg-ereader' ),
							value: item.href || '',
							onChange: function ( value ) {
								setAttributes( {
									items: updateItem( items, index, 'href', value ),
								} );
							},
						} ),
						el( TextControl, {
							label: __( 'Title', 'dsg-ereader' ),
							value: item.title || '',
							onChange: function ( value ) {
								setAttributes( {
									items: updateItem( items, index, 'title', value ),
								} );
							},
						} ),
						el( TextControl, {
							label: __( 'Subtitle', 'dsg-ereader' ),
							value: item.subtitle || '',
							onChange: function ( value ) {
								setAttributes( {
									items: updateItem( items, index, 'subtitle', value ),
								} );
							},
						} ),
						el( TextControl, {
							label: __( 'End marker', 'dsg-ereader' ),
							value: item.marker || '',
							onChange: function ( value ) {
								setAttributes( {
									items: updateItem( items, index, 'marker', value ),
								} );
							},
						} ),
						el( Button, {
							isDestructive: true,
							variant: 'secondary',
							onClick: function () {
								setAttributes( {
									items: items.filter( function ( _, itemIndex ) {
										return itemIndex !== index;
									} ),
								} );
							},
						}, __( 'Remove row', 'dsg-ereader' ) )
					);
				} ),
				el( Button, {
					variant: 'primary',
					onClick: function () {
						setAttributes( {
							items: items.concat( [
								{
									label: '',
									href: '#',
									title: __( 'New section', 'dsg-ereader' ),
									subtitle: '',
									marker: '',
								},
							] ),
						} );
					},
				}, __( 'Add row', 'dsg-ereader' ) )
			)
		);
	}

	function Edit( props ) {
		var blockProps = useBlockProps( {
			className: 'dsg-contents-editor-preview',
		} );

		return el(
			'div',
			blockProps,
			el( ContentsControls, props ),
			el( ServerSideRender, {
				block: 'dsg/contents',
				attributes: props.attributes,
			} )
		);
	}

	registerBlockType( 'dsg/contents', {
		title: __( 'Reader Contents', 'dsg-ereader' ),
		description: __( 'Render the homepage table of contents without raw HTML.', 'dsg-ereader' ),
		category: 'theme',
		icon: 'list-view',
		attributes: {
			id: {
				type: 'string',
				default: 'contents',
			},
			heading: {
				type: 'string',
				default: 'Contents',
			},
			items: {
				type: 'array',
				default: defaultItems,
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
