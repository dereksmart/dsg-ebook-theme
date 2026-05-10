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
	var ServerSideRender = wp.serverSideRender.default || wp.serverSideRender;

	function ReaderFooterControls( props ) {
		var attributes = props.attributes;
		var setAttributes = props.setAttributes;

		return el(
			InspectorControls,
			null,
			el(
				PanelBody,
				{
					title: __( 'Initial labels', 'dsg-ereader' ),
					initialOpen: true,
				},
				el( TextControl, {
					label: __( 'Initial percent', 'dsg-ereader' ),
					value: attributes.initialPercent || '',
					onChange: function ( value ) {
						setAttributes( { initialPercent: value } );
					},
				} ),
				el( TextControl, {
					label: __( 'Initial time left', 'dsg-ereader' ),
					value: attributes.initialTimeLeft || '',
					onChange: function ( value ) {
						setAttributes( { initialTimeLeft: value } );
					},
				} )
			)
		);
	}

	function Edit( props ) {
		var blockProps = useBlockProps( {
			className: 'dsg-reader-footer-editor-preview',
		} );

		return el(
			'div',
			blockProps,
			el( ReaderFooterControls, props ),
			el( ServerSideRender, {
				block: 'dsg/reader-footer',
				attributes: props.attributes,
			} )
		);
	}

	registerBlockType( 'dsg/reader-footer', {
		title: __( 'Reader Footer', 'dsg-ereader' ),
		description: __( 'Render the fixed ereader footer progress chrome.', 'dsg-ereader' ),
		category: 'theme',
		icon: 'minus',
		attributes: {
			initialPercent: {
				type: 'string',
				default: '0%',
			},
			initialTimeLeft: {
				type: 'string',
				default: 'about 2m left',
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
