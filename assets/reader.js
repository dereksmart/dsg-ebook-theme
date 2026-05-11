/**
 * DSG E-reader — reader.js
 *
 * Front-end runtime for the e-reader chrome:
 *   - Footnote auto-numbering + click-to-popover
 *   - Dictionary popover for `.dsg-define`
 *   - Reader controls (text scale, font, width, line height, theme)
 *   - Reading progress bar + estimated time-left
 *   - Chapter-jump arrows, keyboard shortcuts, and essay swipe navigation
 */
( function () {
	'use strict';

	// --------- popover ---------
	function ensurePopover() {
		var pop = document.getElementById( 'dsg-popover' );
		if ( pop ) {
			return pop;
		}
		pop = document.createElement( 'div' );
		pop.id = 'dsg-popover';
		pop.className = 'dsg-popover';
		pop.setAttribute( 'role', 'dialog' );
		pop.innerHTML =
			'<div class="dsg-pop-label">' +
				'<span class="dsg-pop-label-text">Note</span>' +
				'<button class="dsg-pop-close" type="button" aria-label="Close">close ⌫</button>' +
			'</div>' +
			'<div class="dsg-pop-content"></div>';
		document.body.appendChild( pop );
		pop.querySelector( '.dsg-pop-close' ).addEventListener( 'click', hidePopover );
		return pop;
	}
	function showPopover( labelText, contentHtml ) {
		var pop = ensurePopover();
		pop.querySelector( '.dsg-pop-label-text' ).textContent = labelText;
		pop.querySelector( '.dsg-pop-content' ).innerHTML = contentHtml;
		pop.classList.add( 'is-open' );
	}
	function hidePopover() {
		var pop = document.getElementById( 'dsg-popover' );
		if ( pop ) {
			pop.classList.remove( 'is-open' );
		}
	}

	// --------- footnotes (auto-numbered across the page) ---------
	function wireFootnotes() {
		var markers = document.querySelectorAll( '.dsg-footnote-marker' );
		markers.forEach( function ( m, i ) {
			var n = i + 1;
			if ( ! m.hasAttribute( 'data-fn-original' ) ) {
				m.setAttribute( 'data-fn-original', m.textContent );
				m.textContent = String( n );
			}
			m.setAttribute( 'data-fn-n', String( n ) );
			m.addEventListener( 'click', function ( e ) {
				e.preventDefault();
				e.stopPropagation();
				var note = m.getAttribute( 'data-fn-text' ) || m.getAttribute( 'data-fn-original' ) || '';
				showPopover(
					'Footnote ' + n,
					'<div class="dsg-pop-body">' + escapeHTML( note ) + '</div>'
				);
			} );
		} );
	}

	// --------- dictionary lookups ---------
	function wireDefine() {
		document.querySelectorAll( '.dsg-define' ).forEach( function ( el ) {
			el.addEventListener( 'click', function ( e ) {
				e.stopPropagation();
				var word = el.textContent;
				var def = el.getAttribute( 'data-def' ) || '';
				var pron = el.getAttribute( 'data-pron' ) || '';
				showPopover(
					'Dictionary',
					'<div class="dsg-pop-word">' + escapeHTML( word ) + '</div>' +
						( pron ? '<div class="dsg-pop-pron">/' + escapeHTML( pron ) + '/</div>' : '' ) +
						'<div class="dsg-pop-body">' + escapeHTML( def ) + '</div>'
				);
			} );
		} );
	}

	// --------- chapter jump arrows ---------
	function ensurePageTurns() {
		if ( document.querySelector( '.dsg-pageturn' ) ) {
			return;
		}
		var left = document.createElement( 'button' );
		left.type = 'button';
		left.className = 'dsg-pageturn dsg-pt-left';
		left.setAttribute( 'aria-label', 'Previous section' );
		left.textContent = '‹';
		var right = document.createElement( 'button' );
		right.type = 'button';
		right.className = 'dsg-pageturn dsg-pt-right';
		right.setAttribute( 'aria-label', 'Next section' );
		right.textContent = '›';
		document.body.appendChild( left );
		document.body.appendChild( right );
		updatePageTurnLabels();
		left.addEventListener( 'click', function () { turnPage( -1 ); } );
		right.addEventListener( 'click', function () { turnPage( 1 ); } );
	}
	function updatePageTurnLabels() {
		var hasEssayNav = !! document.querySelector( '.dsg-essay-nav' );
		var prev = document.querySelector( '.dsg-essay-nav-prev:not(.is-empty)' );
		var next = document.querySelector( '.dsg-essay-nav-next:not(.is-empty)' );
		var left = document.querySelector( '.dsg-pt-left' );
		var right = document.querySelector( '.dsg-pt-right' );
		if ( left ) {
			left.classList.toggle( 'is-disabled', hasEssayNav && ! prev );
			left.setAttribute( 'aria-label', prev ? 'Previous chapter' : 'Previous section' );
		}
		if ( right ) {
			right.classList.toggle( 'is-disabled', hasEssayNav && ! next );
			right.setAttribute( 'aria-label', next ? 'Next chapter' : 'Next section' );
		}
	}
	function turnPage( dir ) {
		var link = getEssayTurnLink( dir );
		if ( link && link.href ) {
			window.location.href = link.href;
			return;
		}
		if ( document.querySelector( '.dsg-essay-nav' ) ) {
			return;
		}
		jumpSection( dir );
	}
	function getEssayTurnLink( dir ) {
		var selector = dir < 0 ? '.dsg-essay-nav-prev:not(.is-empty)' : '.dsg-essay-nav-next:not(.is-empty)';
		return document.querySelector( selector );
	}
	function jumpSection( dir ) {
		var sections = document.querySelectorAll(
			'.dsg-cover, .dsg-toc, .dsg-essays-block, .dsg-archive, .dsg-chapter'
		);
		if ( ! sections.length ) {
			window.scrollBy( { top: dir * window.innerHeight * 0.85, behavior: 'smooth' } );
			return;
		}
		var threshold = window.scrollY + 120;
		var idx = 0;
		sections.forEach( function ( s, i ) {
			if ( s.offsetTop <= threshold ) { idx = i; }
		} );
		var next = Math.max( 0, Math.min( sections.length - 1, idx + dir ) );
		sections[ next ].scrollIntoView( { behavior: 'smooth', block: 'start' } );
	}

	// --------- reader controls ---------
	function setReaderPanelOpen( open ) {
		var trigger = document.getElementById( 'dsg-reader-trigger' );
		var panel = document.getElementById( 'dsg-reader-panel' );
		if ( ! trigger || ! panel ) {
			return;
		}
		panel.classList.toggle( 'is-open', !! open );
		panel.setAttribute( 'aria-hidden', open ? 'false' : 'true' );
		trigger.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
	}
	function isReaderPanelOpen() {
		var panel = document.getElementById( 'dsg-reader-panel' );
		return !! ( panel && panel.classList.contains( 'is-open' ) );
	}
	function wireReaderControls() {
		var trigger = document.getElementById( 'dsg-reader-trigger' );
		var panel = document.getElementById( 'dsg-reader-panel' );
		var dec = document.getElementById( 'dsg-type-dec' );
		var inc = document.getElementById( 'dsg-type-inc' );
		var status = document.getElementById( 'dsg-type-status' );
		var fontBtns = document.querySelectorAll( '[data-reader-font]' );
		var widthBtns = document.querySelectorAll( '[data-reader-width]' );
		var leadingBtns = document.querySelectorAll( '[data-reader-leading]' );
		var themeBtns = document.querySelectorAll( '[data-reader-theme]' );
		if (
			! trigger ||
			! panel ||
			! dec ||
			! inc ||
			! status ||
			! fontBtns.length ||
			! widthBtns.length ||
			! leadingBtns.length ||
			! themeBtns.length
		) {
			return;
		}
		var sizes = [
			{
				key: 'small',
				label: '94%',
				vars: {
					'--dsg-reader-scale': '0.94',
					'--dsg-copy-size': '17px',
					'--dsg-small-copy-size': '15px',
					'--dsg-list-title-size': '21px',
					'--dsg-section-title-size': '23px',
					'--dsg-chapter-title-size': '39px',
					'--dsg-archive-title-size': '39px',
					'--dsg-toc-heading-size': '27px',
					'--dsg-toc-subtitle-size': '13px',
					'--dsg-coda-note-size': '19px',
					'--dsg-label-size': '13px',
					'--dsg-small-label-size': '10px',
					'--dsg-cover-title-size': '68px',
					'--dsg-cover-subtitle-size': '23px',
					'--dsg-cover-author-size': '13px',
					'--dsg-cover-author-name-size': '17px',
					'--dsg-cover-meta-size': '10px'
				}
			},
			{
				key: 'base',
				label: '100%',
				vars: {
					'--dsg-reader-scale': '1',
					'--dsg-copy-size': '18px',
					'--dsg-small-copy-size': '16px',
					'--dsg-list-title-size': '22px',
					'--dsg-section-title-size': '24px',
					'--dsg-chapter-title-size': '42px',
					'--dsg-archive-title-size': '42px',
					'--dsg-toc-heading-size': '28px',
					'--dsg-toc-subtitle-size': '13px',
					'--dsg-coda-note-size': '20px',
					'--dsg-label-size': '14px',
					'--dsg-small-label-size': '11px',
					'--dsg-cover-title-size': '72px',
					'--dsg-cover-subtitle-size': '24px',
					'--dsg-cover-author-size': '14px',
					'--dsg-cover-author-name-size': '18px',
					'--dsg-cover-meta-size': '10px'
				}
			},
			{
				key: 'large',
				label: '112%',
				vars: {
					'--dsg-reader-scale': '1.12',
					'--dsg-copy-size': '20px',
					'--dsg-small-copy-size': '18px',
					'--dsg-list-title-size': '25px',
					'--dsg-section-title-size': '27px',
					'--dsg-chapter-title-size': '47px',
					'--dsg-archive-title-size': '47px',
					'--dsg-toc-heading-size': '31px',
					'--dsg-toc-subtitle-size': '15px',
					'--dsg-coda-note-size': '22px',
					'--dsg-label-size': '15px',
					'--dsg-small-label-size': '12px',
					'--dsg-cover-title-size': '80px',
					'--dsg-cover-subtitle-size': '27px',
					'--dsg-cover-author-size': '15px',
					'--dsg-cover-author-name-size': '20px',
					'--dsg-cover-meta-size': '11px'
				}
			},
			{
				key: 'xlarge',
				label: '124%',
				vars: {
					'--dsg-reader-scale': '1.24',
					'--dsg-copy-size': '22px',
					'--dsg-small-copy-size': '20px',
					'--dsg-list-title-size': '27px',
					'--dsg-section-title-size': '30px',
					'--dsg-chapter-title-size': '52px',
					'--dsg-archive-title-size': '52px',
					'--dsg-toc-heading-size': '34px',
					'--dsg-toc-subtitle-size': '16px',
					'--dsg-coda-note-size': '25px',
					'--dsg-label-size': '16px',
					'--dsg-small-label-size': '12px',
					'--dsg-cover-title-size': '88px',
					'--dsg-cover-subtitle-size': '30px',
					'--dsg-cover-author-size': '16px',
					'--dsg-cover-author-name-size': '22px',
					'--dsg-cover-meta-size': '12px'
				}
			}
		];
		var fonts = {
			serif: "Literata, 'Iowan Old Style', Georgia, serif",
			sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
			mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
		};
		var widths = {
			narrow: {
				vars: {
					'--dsg-page-width': '680px',
					'--dsg-reading-width': '600px'
				}
			},
			standard: {
				vars: {
					'--dsg-page-width': '760px',
					'--dsg-reading-width': '680px'
				}
			},
			wide: {
				vars: {
					'--dsg-page-width': '880px',
					'--dsg-reading-width': '760px'
				}
			}
		};
		var leadings = {
			tight: {
				vars: {
					'--dsg-reader-line-height': '1.52',
					'--dsg-reader-small-line-height': '1.42'
				}
			},
			standard: {
				vars: {
					'--dsg-reader-line-height': '1.68',
					'--dsg-reader-small-line-height': '1.55'
				}
			},
			loose: {
				vars: {
					'--dsg-reader-line-height': '1.82',
					'--dsg-reader-small-line-height': '1.68'
				}
			}
		};
		var sIdx = readInt( 'dsg-reader-size-step', legacySizeStep(), sizes.length );
		var theme = readTheme();
		var font = readFont( fonts );
		var width = readChoice( 'dsg-reader-page-width', widths, 'standard' );
		var leading = readChoice( 'dsg-reader-line-height', leadings, 'standard' );

		trigger.addEventListener( 'click', function ( e ) {
			e.stopPropagation();
			setReaderPanelOpen( ! isReaderPanelOpen() );
		} );
		panel.addEventListener( 'click', function ( e ) {
			e.stopPropagation();
		} );
		document.addEventListener( 'click', function ( e ) {
			if ( ! isReaderPanelOpen() ) {
				return;
			}
			if ( panel.contains( e.target ) || trigger.contains( e.target ) ) {
				return;
			}
			setReaderPanelOpen( false );
		} );

		dec.addEventListener( 'click', function () {
			if ( sIdx > 0 ) {
				sIdx--;
				applyReaderPrefs( true );
			}
		} );
		inc.addEventListener( 'click', function () {
			if ( sIdx < sizes.length - 1 ) {
				sIdx++;
				applyReaderPrefs( true );
			}
		} );
		fontBtns.forEach( function ( btn ) {
			btn.addEventListener( 'click', function () {
				var next = btn.getAttribute( 'data-reader-font' );
				if ( ! fonts[ next ] ) {
					return;
				}
				font = next;
				applyReaderPrefs( true );
			} );
		} );
		widthBtns.forEach( function ( btn ) {
			btn.addEventListener( 'click', function () {
				var next = btn.getAttribute( 'data-reader-width' );
				if ( ! widths[ next ] ) {
					return;
				}
				width = next;
				applyReaderPrefs( true );
			} );
		} );
		leadingBtns.forEach( function ( btn ) {
			btn.addEventListener( 'click', function () {
				var next = btn.getAttribute( 'data-reader-leading' );
				if ( ! leadings[ next ] ) {
					return;
				}
				leading = next;
				applyReaderPrefs( true );
			} );
		} );
		themeBtns.forEach( function ( btn ) {
			btn.addEventListener( 'click', function () {
				var next = btn.getAttribute( 'data-reader-theme' );
				if ( next !== 'light' && next !== 'dark' ) {
					return;
				}
				theme = next;
				applyReaderPrefs( true );
			} );
		} );

		applyReaderPrefs( false );

		function applyReaderPrefs( persist ) {
			var size = sizes[ sIdx ];
			document.documentElement.setAttribute( 'data-reader-size', size.key );
			Object.keys( size.vars ).forEach( function ( name ) {
				document.documentElement.style.setProperty( name, size.vars[ name ] );
			} );
			document.documentElement.setAttribute( 'data-theme', theme );
			document.documentElement.setAttribute( 'data-reader-font', font );
			document.documentElement.style.setProperty( '--dsg-reader-font', fonts[ font ] );
			document.documentElement.setAttribute( 'data-reader-width', width );
			applyVars( widths[ width ].vars );
			document.documentElement.setAttribute( 'data-reader-leading', leading );
			applyVars( leadings[ leading ].vars );
			status.textContent = size.label;
			status.setAttribute( 'aria-label', 'Text size ' + size.label );
			dec.disabled = sIdx === 0;
			inc.disabled = sIdx === sizes.length - 1;
			fontBtns.forEach( function ( btn ) {
				btn.setAttribute( 'aria-pressed', btn.getAttribute( 'data-reader-font' ) === font ? 'true' : 'false' );
			} );
			widthBtns.forEach( function ( btn ) {
				btn.setAttribute( 'aria-pressed', btn.getAttribute( 'data-reader-width' ) === width ? 'true' : 'false' );
			} );
			leadingBtns.forEach( function ( btn ) {
				btn.setAttribute( 'aria-pressed', btn.getAttribute( 'data-reader-leading' ) === leading ? 'true' : 'false' );
			} );
			themeBtns.forEach( function ( btn ) {
				btn.setAttribute( 'aria-pressed', btn.getAttribute( 'data-reader-theme' ) === theme ? 'true' : 'false' );
			} );
			window.dispatchEvent( new Event( 'resize' ) );
			if ( ! persist ) {
				return;
			}
			try {
				localStorage.setItem( 'dsg-reader-size-step', String( sIdx ) );
				localStorage.setItem( 'dsg-reader-theme', theme );
				localStorage.setItem( 'dsg-reader-font', font );
				localStorage.setItem( 'dsg-reader-page-width', width );
				localStorage.setItem( 'dsg-reader-line-height', leading );
			} catch ( e ) { /* noop */ }
		}
	}

	// --------- reading progress + time left ---------
	function wireProgress() {
		var fill = document.getElementById( 'dsg-fill' );
		var pct = document.getElementById( 'dsg-pct' );
		var timeLeft = document.getElementById( 'dsg-time-left' );
		if ( ! fill ) {
			return;
		}
		var sections = Array.prototype.slice.call(
			document.querySelectorAll( '.dsg-cover, .dsg-toc, .dsg-chapter, .dsg-essays-chapter, .dsg-archive' )
		);
		var isHomepage = document.body.classList.contains( 'home' ) && sections.length > 1;
		var readingEl = document.querySelector( '.dsg-chapter-content' ) ||
			document.querySelector( '.dsg-page-content' ) ||
			document.querySelector( 'article.dsg-chapter' ) ||
			document.querySelector( '.dsg-main' ) ||
			document.querySelector( 'main' );
		var totalMin = readingTimeFor( readingEl ) || 1;

		function fmt( m ) {
			if ( m < 1 ) { return 'a moment left'; }
			if ( m < 60 ) { return 'about ' + Math.round( m ) + 'm left'; }
			var h = Math.floor( m / 60 );
			var mm = Math.round( m - h * 60 );
			return 'about ' + h + 'h ' + mm + 'm left';
		}
		function update() {
			var p = readingProgressFor( isHomepage ? null : readingEl );
			fill.style.width = ( p * 100 ).toFixed( 1 ) + '%';
			if ( pct ) { pct.textContent = Math.round( p * 100 ) + '%'; }
			if ( timeLeft ) {
				timeLeft.textContent = isHomepage ? sectionLabel( sections ) : fmt( totalMin * ( 1 - p ) );
			}
		}
		window.addEventListener( 'scroll', update, { passive: true } );
		window.addEventListener( 'resize', update );
		update();
	}
	function readingProgressFor( el ) {
		if ( el ) {
			var start = el.getBoundingClientRect().top + window.scrollY - 80;
			var end = el.getBoundingClientRect().bottom + window.scrollY - window.innerHeight + 80;
			if ( end > start ) {
				return Math.min( 1, Math.max( 0, ( window.scrollY - start ) / ( end - start ) ) );
			}
		}
		var doc = document.documentElement;
		var max = ( doc.scrollHeight - window.innerHeight ) || 1;
		return Math.min( 1, Math.max( 0, window.scrollY / max ) );
	}
	function sectionLabel( sections ) {
		if ( ! sections.length ) {
			return 'section 1 of 1';
		}
		var threshold = window.scrollY + Math.min( window.innerHeight * 0.42, 320 );
		var idx = 0;
		sections.forEach( function ( section, i ) {
			if ( section.offsetTop <= threshold ) {
				idx = i;
			}
		} );
		return 'section ' + ( idx + 1 ) + ' of ' + sections.length;
	}
	function readingTimeFor( el ) {
		if ( ! el ) { return 0; }
		var text = ( el.textContent || '' ).trim();
		if ( ! text ) { return 0; }
		var words = text.split( /\s+/ ).length;
		return Math.max( 1, Math.round( words / 220 ) );
	}

	// --------- keyboard shortcuts ---------
	function wireKeyboard() {
		document.addEventListener( 'keydown', function ( e ) {
			if ( e.target.closest( 'input, textarea, [contenteditable]' ) ) { return; }
			if ( e.key === 'ArrowLeft' || e.key === 'PageUp' ) {
				turnPage( -1 );
			} else if ( e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' ) {
				e.preventDefault();
				turnPage( 1 );
			} else if ( e.key === 'Escape' ) {
				hidePopover();
				setReaderPanelOpen( false );
			}
		} );
	}

	// --------- mobile essay swipes ---------
	function wireEssaySwipe() {
		if ( ! document.querySelector( '.dsg-essay-nav' ) ) {
			return;
		}
		if ( window.PointerEvent ) {
			wirePointerEssaySwipe();
			return;
		}
		if ( ! ( 'ontouchstart' in window ) ) {
			return;
		}

		var startX = 0;
		var startY = 0;
		var lastX = 0;
		var lastY = 0;
		var tracking = false;
		var ignored = false;
		var dragging = false;

		document.addEventListener( 'touchstart', function ( e ) {
			if ( e.touches.length !== 1 ) {
				resetSwipe();
				return;
			}
			ignored = isSwipeTargetIgnored( e.target );
			tracking = ! ignored;
			dragging = false;
			startX = e.touches[0].clientX;
			startY = e.touches[0].clientY;
			lastX = startX;
			lastY = startY;
		}, { passive: true } );

		document.addEventListener( 'touchmove', function ( e ) {
			if ( e.touches.length !== 1 ) {
				resetSwipe();
				return;
			}
			if ( ! tracking || ignored ) {
				return;
			}
			lastX = e.touches[0].clientX;
			lastY = e.touches[0].clientY;
			var dx = lastX - startX;
			var dy = lastY - startY;
			var absX = Math.abs( dx );
			var absY = Math.abs( dy );
			if ( ! dragging && absX > 12 && absX > absY * 1.2 ) {
				dragging = true;
				document.body.classList.add( 'dsg-is-swiping' );
			}
			if ( dragging ) {
				e.preventDefault();
				renderSwipe( dx );
			}
		}, { passive: false } );

		document.addEventListener( 'touchend', function () {
			if ( ! tracking || ignored ) {
				resetSwipe();
				return;
			}
			var dx = lastX - startX;
			var dy = lastY - startY;
			completeSwipe( dx, dy, dragging );
			resetSwipe();
		}, { passive: true } );

		document.addEventListener( 'touchcancel', resetSwipe, { passive: true } );

		function resetSwipe() {
			tracking = false;
			ignored = false;
			startX = 0;
			startY = 0;
			lastX = 0;
			lastY = 0;
			dragging = false;
		}
	}
	function wirePointerEssaySwipe() {
		var startX = 0;
		var startY = 0;
		var lastX = 0;
		var lastY = 0;
		var pointerId = null;
		var tracking = false;
		var dragging = false;

		document.addEventListener( 'pointerdown', function ( e ) {
			if ( ! e.isPrimary || isSwipeTargetIgnored( e.target ) ) {
				return;
			}
			if ( e.pointerType === 'mouse' ) {
				return;
			}
			pointerId = e.pointerId;
			tracking = true;
			dragging = false;
			startX = e.clientX;
			startY = e.clientY;
			lastX = startX;
			lastY = startY;
			if ( e.target && e.target.setPointerCapture ) {
				try {
					e.target.setPointerCapture( pointerId );
				} catch ( err ) { /* noop */ }
			}
		}, { passive: true } );

		document.addEventListener( 'pointermove', function ( e ) {
			if ( ! tracking || e.pointerId !== pointerId ) {
				return;
			}
			lastX = e.clientX;
			lastY = e.clientY;
			var dx = lastX - startX;
			var dy = lastY - startY;
			var absX = Math.abs( dx );
			var absY = Math.abs( dy );
			if ( ! dragging && absX > 12 && absX > absY * 1.2 ) {
				dragging = true;
				document.body.classList.add( 'dsg-is-swiping' );
			}
			if ( dragging ) {
				e.preventDefault();
				renderSwipe( dx );
			}
		}, { passive: false } );

		document.addEventListener( 'pointerup', function ( e ) {
			if ( ! tracking || e.pointerId !== pointerId ) {
				return;
			}
			completeSwipe( lastX - startX, lastY - startY, dragging );
			resetPointerSwipe();
		}, { passive: true } );

		document.addEventListener( 'pointercancel', function ( e ) {
			if ( e.pointerId === pointerId ) {
				releaseSwipe( false );
				resetPointerSwipe();
			}
		}, { passive: true } );

		function resetPointerSwipe() {
			pointerId = null;
			tracking = false;
			dragging = false;
			startX = 0;
			startY = 0;
			lastX = 0;
			lastY = 0;
		}
	}
	function completeSwipe( dx, dy, dragging ) {
		var absX = Math.abs( dx );
		var absY = Math.abs( dy );
		var dir = dx < 0 ? 1 : -1;
		var link = getEssayTurnLink( dir );
		if ( ! dragging || ! link || absX < 72 || absX < absY * 1.45 ) {
			releaseSwipe( false );
			return;
		}
		releaseSwipe( true, dir );
		window.setTimeout( function () {
			window.location.href = link.href;
		}, 180 );
	}
	function renderSwipe( dx ) {
		var dir = dx < 0 ? 1 : -1;
		var link = getEssayTurnLink( dir );
		var max = Math.min( window.innerWidth * 0.42, 190 );
		var x = Math.max( -max, Math.min( max, dx ) );
		var progress = Math.min( 1, Math.abs( x ) / max );
		var availableProgress = link ? progress : progress * 0.35;
		var foldMax = Math.min( window.innerWidth * 0.38, 156 );
		var foldSize = 24 + availableProgress * ( foldMax - 24 );

		ensurePageFold();
		document.body.classList.toggle( 'dsg-fold-next', dir > 0 );
		document.body.classList.toggle( 'dsg-fold-previous', dir < 0 );
		document.documentElement.style.setProperty( '--dsg-swipe-x', '0px' );
		document.documentElement.style.setProperty( '--dsg-swipe-opacity', '1' );
		document.documentElement.style.setProperty( '--dsg-fold-progress', availableProgress.toFixed( 3 ) );
		document.documentElement.style.setProperty( '--dsg-fold-size', foldSize.toFixed( 1 ) + 'px' );
	}
	function releaseSwipe( commit, dir ) {
		document.body.classList.remove( 'dsg-is-swiping' );
		document.body.classList.add( commit ? 'dsg-swipe-commit' : 'dsg-swipe-cancel' );
		if ( commit ) {
			ensurePageFold();
			document.body.classList.toggle( 'dsg-fold-next', dir > 0 );
			document.body.classList.toggle( 'dsg-fold-previous', dir < 0 );
			document.documentElement.style.setProperty( '--dsg-swipe-x', '0px' );
			document.documentElement.style.setProperty( '--dsg-swipe-opacity', '1' );
			document.documentElement.style.setProperty( '--dsg-fold-progress', '1' );
			document.documentElement.style.setProperty( '--dsg-fold-size', Math.min( window.innerWidth * 0.42, 184 ).toFixed( 1 ) + 'px' );
		} else {
			document.documentElement.style.setProperty( '--dsg-swipe-x', '0px' );
			document.documentElement.style.setProperty( '--dsg-swipe-opacity', '1' );
			document.documentElement.style.setProperty( '--dsg-fold-progress', '0' );
			document.documentElement.style.setProperty( '--dsg-fold-size', '0px' );
		}
		window.setTimeout( clearSwipePresentation, commit ? 220 : 180 );
	}
	function clearSwipePresentation() {
		document.body.classList.remove(
			'dsg-is-swiping',
			'dsg-swipe-cancel',
			'dsg-swipe-commit',
			'dsg-fold-next',
			'dsg-fold-previous'
		);
		document.documentElement.style.removeProperty( '--dsg-swipe-x' );
		document.documentElement.style.removeProperty( '--dsg-swipe-opacity' );
		document.documentElement.style.removeProperty( '--dsg-fold-progress' );
		document.documentElement.style.removeProperty( '--dsg-fold-size' );
	}
	function ensurePageFold() {
		var fold = document.querySelector( '.dsg-page-fold' );
		if ( ! fold ) {
			fold = document.createElement( 'div' );
			fold.className = 'dsg-page-fold';
			fold.setAttribute( 'aria-hidden', 'true' );
			document.body.appendChild( fold );
		}
		if ( ! fold.querySelector( '.dsg-page-fold-under' ) ) {
			var under = document.createElement( 'span' );
			under.className = 'dsg-page-fold-under';
			fold.appendChild( under );
		}
	}
	function isSwipeTargetIgnored( target ) {
		return !! (
			target &&
			target.closest &&
			target.closest(
				'a, button, input, textarea, select, [contenteditable], .dsg-reader-panel, .dsg-popover, .dsg-footnote-marker, .dsg-define'
			)
		);
	}

	// --------- popover dismiss on outside click ---------
	function wireDismiss() {
		document.addEventListener( 'click', function ( e ) {
			var pop = document.getElementById( 'dsg-popover' );
			if ( ! pop || ! pop.classList.contains( 'is-open' ) ) { return; }
			if ( pop.contains( e.target ) ) { return; }
			if ( e.target.closest( '.dsg-footnote-marker' ) ) { return; }
			if ( e.target.closest( '.dsg-define' ) ) { return; }
			hidePopover();
		} );
	}

	// --------- helpers ---------
	function readInt( key, fallback, ceiling ) {
		try {
			var n = parseInt( localStorage.getItem( key ), 10 );
			if ( isNaN( n ) || n < 0 || n >= ceiling ) { return fallback; }
			return n;
		} catch ( e ) {
			return fallback;
		}
	}
	function legacySizeStep() {
		var old = readInt( 'dsg-ebook-size-idx', 2, 5 );
		if ( old <= 1 ) {
			return 0;
		}
		if ( old === 2 ) {
			return 1;
		}
		if ( old === 3 ) {
			return 2;
		}
		return 3;
	}
	function readTheme() {
		try {
			var saved = localStorage.getItem( 'dsg-reader-theme' );
			if ( saved === 'light' || saved === 'dark' ) {
				return saved;
			}
			return readInt( 'dsg-ebook-theme-idx', 0, 2 ) === 1 ? 'dark' : 'light';
		} catch ( e ) {
			return 'light';
		}
	}
	function readFont( fonts ) {
		try {
			var saved = localStorage.getItem( 'dsg-reader-font' );
			if ( Object.prototype.hasOwnProperty.call( fonts, saved ) ) {
				return saved;
			}
		} catch ( e ) { /* noop */ }
		return 'serif';
	}
	function readChoice( key, choices, fallback ) {
		try {
			var saved = localStorage.getItem( key );
			if ( Object.prototype.hasOwnProperty.call( choices, saved ) ) {
				return saved;
			}
		} catch ( e ) { /* noop */ }
		return fallback;
	}
	function applyVars( vars ) {
		Object.keys( vars ).forEach( function ( name ) {
			document.documentElement.style.setProperty( name, vars[ name ] );
		} );
	}
	function escapeHTML( s ) {
		return String( s )
			.replace( /&/g, '&amp;' )
			.replace( /</g, '&lt;' )
			.replace( />/g, '&gt;' )
			.replace( /"/g, '&quot;' )
			.replace( /'/g, '&#39;' );
	}

	// --------- init ---------
	function init() {
		ensurePageTurns();
		wireFootnotes();
		wireDefine();
		wireReaderControls();
		wireProgress();
		wireKeyboard();
		wireEssaySwipe();
		wireDismiss();
	}
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )();
