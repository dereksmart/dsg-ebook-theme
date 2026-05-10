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
	var RangeControl = wp.components.RangeControl;
	var SelectControl = wp.components.SelectControl;
	var TextControl = wp.components.TextControl;
	var ToggleControl = wp.components.ToggleControl;
	var ServerSideRender = wp.serverSideRender.default || wp.serverSideRender;

	function EssaysControls( props ) {
		var attributes = props.attributes;
		var setAttributes = props.setAttributes;

		return el(
			InspectorControls,
			null,
			el(
				PanelBody,
				{
					title: __( 'Chapter copy', 'dsg-ereader' ),
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
					label: __( 'Section label', 'dsg-ereader' ),
					placeholder: __( 'Reading List', 'dsg-ereader' ),
					value: attributes.chapter || '',
					onChange: function ( value ) {
						setAttributes( { chapter: value } );
					},
				} ),
				el( TextControl, {
					label: __( 'Heading', 'dsg-ereader' ),
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
					title: __( 'Post query', 'dsg-ereader' ),
					initialOpen: true,
				},
				el( RangeControl, {
					label: __( 'Number of essays', 'dsg-ereader' ),
					value: attributes.perPage || 5,
					min: 1,
					max: 20,
					onChange: function ( value ) {
						setAttributes( { perPage: value } );
					},
				} ),
				el( SelectControl, {
					label: __( 'Order by', 'dsg-ereader' ),
					value: attributes.orderBy || 'date',
					options: [
						{ label: __( 'Publish date', 'dsg-ereader' ), value: 'date' },
						{ label: __( 'Title', 'dsg-ereader' ), value: 'title' },
						{ label: __( 'Menu order', 'dsg-ereader' ), value: 'menu_order' },
					],
					onChange: function ( value ) {
						setAttributes( { orderBy: value } );
					},
				} ),
				el( SelectControl, {
					label: __( 'Order', 'dsg-ereader' ),
					value: attributes.order || 'desc',
					options: [
						{ label: __( 'Newest first', 'dsg-ereader' ), value: 'desc' },
						{ label: __( 'Oldest first', 'dsg-ereader' ), value: 'asc' },
					],
					onChange: function ( value ) {
						setAttributes( { order: value } );
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
					label: __( 'Show dates', 'dsg-ereader' ),
					checked: attributes.showDates !== false,
					onChange: function ( value ) {
						setAttributes( { showDates: value } );
					},
				} ),
				el( TextControl, {
					label: __( 'Date format', 'dsg-ereader' ),
					help: __( 'Uses WordPress date format strings.', 'dsg-ereader' ),
					value: attributes.dateFormat || '',
					onChange: function ( value ) {
						setAttributes( { dateFormat: value } );
					},
				} ),
				el( TextControl, {
					label: __( 'Empty text', 'dsg-ereader' ),
					value: attributes.emptyText || '',
					onChange: function ( value ) {
						setAttributes( { emptyText: value } );
					},
				} ),
				el( ToggleControl, {
					label: __( 'Show closing ornament', 'dsg-ereader' ),
					checked: !! attributes.showOrnament,
					onChange: function ( value ) {
						setAttributes( { showOrnament: value } );
					},
				} )
			)
		);
	}

	function Edit( props ) {
		var blockProps = useBlockProps( {
			className: 'dsg-essays-chapter-editor-preview',
		} );

		return el(
			'div',
			blockProps,
			el( EssaysControls, props ),
			el( ServerSideRender, {
				block: 'dsg/essays-chapter',
				attributes: props.attributes,
			} )
		);
	}

	registerBlockType( 'dsg/essays-chapter', {
		title: __( 'Essays Chapter', 'dsg-ereader' ),
		description: __( 'Render recent Posts as an ereader essays chapter.', 'dsg-ereader' ),
		category: 'theme',
		icon: 'welcome-write-blog',
		attributes: {
			id: {
				type: 'string',
				default: 'essays',
			},
			chapter: {
				type: 'string',
				default: 'Reading List',
			},
			title: {
				type: 'string',
				default: 'Essays',
			},
			dek: {
				type: 'string',
				default: 'occasional writing, in reverse chronological',
			},
			perPage: {
				type: 'number',
				default: 5,
			},
			order: {
				type: 'string',
				default: 'desc',
			},
			orderBy: {
				type: 'string',
				default: 'date',
			},
			dateFormat: {
				type: 'string',
				default: 'M Y',
			},
			emptyText: {
				type: 'string',
				default: 'No essays yet — watch this space.',
			},
			showDates: {
				type: 'boolean',
				default: true,
			},
			showOrnament: {
				type: 'boolean',
				default: false,
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
