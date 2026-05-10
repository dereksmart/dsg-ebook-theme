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
	var ToggleControl = wp.components.ToggleControl;
	var ServerSideRender = wp.serverSideRender.default || wp.serverSideRender;
	var defaultNavItems = [
		{
			label: 'Contents',
			href: '/#contents',
		},
		{
			label: 'Works',
			href: '/#works',
		},
		{
			label: 'Essays',
			href: '/#essays',
		},
	];

	function normalizeItems( items ) {
		return Array.isArray( items ) ? items : defaultNavItems;
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

	function ReaderHeaderControls( props ) {
		var attributes = props.attributes;
		var setAttributes = props.setAttributes;
		var navItems = normalizeItems( attributes.navItems );

		return el(
			InspectorControls,
			null,
			el(
				PanelBody,
				{
					title: __( 'Site mark', 'dsg-ereader' ),
					initialOpen: true,
				},
				el( TextControl, {
					label: __( 'Site label', 'dsg-ereader' ),
					help: __( 'Leave blank to use the site title.', 'dsg-ereader' ),
					value: attributes.siteLabel || '',
					onChange: function ( value ) {
						setAttributes( { siteLabel: value } );
					},
				} ),
				el( TextControl, {
					label: __( 'Site link', 'dsg-ereader' ),
					value: attributes.siteHref || '',
					onChange: function ( value ) {
						setAttributes( { siteHref: value } );
					},
				} )
			),
			el(
				PanelBody,
				{
					title: __( 'Navigation', 'dsg-ereader' ),
					initialOpen: true,
				},
				navItems.map( function ( item, index ) {
					return el(
						'div',
						{
							className: 'dsg-reader-header-row-controls',
							key: index,
						},
						el( TextControl, {
							label: __( 'Label', 'dsg-ereader' ),
							value: item.label || '',
							onChange: function ( value ) {
								setAttributes( {
									navItems: updateItem( navItems, index, 'label', value ),
								} );
							},
						} ),
						el( TextControl, {
							label: __( 'Link', 'dsg-ereader' ),
							value: item.href || '',
							onChange: function ( value ) {
								setAttributes( {
									navItems: updateItem( navItems, index, 'href', value ),
								} );
							},
						} ),
						el( Button, {
							isDestructive: true,
							variant: 'secondary',
							onClick: function () {
								setAttributes( {
									navItems: navItems.filter( function ( _, itemIndex ) {
										return itemIndex !== index;
									} ),
								} );
							},
						}, __( 'Remove item', 'dsg-ereader' ) )
					);
				} ),
				el( Button, {
					variant: 'primary',
					onClick: function () {
						setAttributes( {
							navItems: navItems.concat( [
								{
									label: __( 'New item', 'dsg-ereader' ),
									href: '#',
								},
							] ),
						} );
					},
				}, __( 'Add item', 'dsg-ereader' ) )
			),
			el(
				PanelBody,
				{
					title: __( 'Reader controls', 'dsg-ereader' ),
					initialOpen: false,
				},
				el( ToggleControl, {
					label: __( 'Show reader settings trigger', 'dsg-ereader' ),
					checked: attributes.showReaderSettings !== false,
					onChange: function ( value ) {
						setAttributes( { showReaderSettings: value } );
					},
				} )
			)
		);
	}

	function Edit( props ) {
		var blockProps = useBlockProps( {
			className: 'dsg-reader-header-editor-preview',
		} );

		return el(
			'div',
			blockProps,
			el( ReaderHeaderControls, props ),
			el( ServerSideRender, {
				block: 'dsg/reader-header',
				attributes: props.attributes,
			} )
		);
	}

	registerBlockType( 'dsg/reader-header', {
		title: __( 'Reader Header', 'dsg-ereader' ),
		description: __( 'Render the fixed ereader header chrome.', 'dsg-ereader' ),
		category: 'theme',
		icon: 'align-wide',
		attributes: {
			siteLabel: {
				type: 'string',
				default: '',
			},
			siteHref: {
				type: 'string',
				default: '/',
			},
			showReaderSettings: {
				type: 'boolean',
				default: true,
			},
			navItems: {
				type: 'array',
				default: defaultNavItems,
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
