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
	var TextControl = wp.components.TextControl;
	var ToggleControl = wp.components.ToggleControl;
	var ServerSideRender = wp.serverSideRender.default || wp.serverSideRender;

	function EssayNavigationControls( props ) {
		var attributes = props.attributes;
		var setAttributes = props.setAttributes;

		return el(
			InspectorControls,
			null,
			el(
				PanelBody,
				{
					title: __( 'Back link', 'dsg-ereader' ),
					initialOpen: true,
				},
				el( ToggleControl, {
					label: __( 'Show all essays link', 'dsg-ereader' ),
					checked: attributes.showBackLink !== false,
					onChange: function ( value ) {
						setAttributes( { showBackLink: value } );
					},
				} ),
				el( TextControl, {
					label: __( 'Back link label', 'dsg-ereader' ),
					value: attributes.backLabel || '',
					onChange: function ( value ) {
						setAttributes( { backLabel: value } );
					},
				} ),
				el( TextControl, {
					label: __( 'Back link URL', 'dsg-ereader' ),
					value: attributes.backHref || '',
					onChange: function ( value ) {
						setAttributes( { backHref: value } );
					},
				} )
			)
		);
	}

	function Edit( props ) {
		var blockProps = useBlockProps( {
			className: 'dsg-essay-navigation-editor-preview',
		} );

		return el(
			'div',
			blockProps,
			el( EssayNavigationControls, props ),
			el( ServerSideRender, {
				block: 'dsg/essay-navigation',
				attributes: props.attributes,
			} )
		);
	}

	registerBlockType( 'dsg/essay-navigation', {
		title: __( 'Essay Navigation', 'dsg-ereader' ),
		description: __( 'Render previous and next essay links in chapter order.', 'dsg-ereader' ),
		category: 'theme',
		icon: 'leftright',
		attributes: {
			backLabel: {
				type: 'string',
				default: 'All essays',
			},
			backHref: {
				type: 'string',
				default: '/#essays',
			},
			showBackLink: {
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
