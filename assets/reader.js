/**
 * DSG Ebook — reader.js
 *
 * Front-end runtime for the e-reader chrome:
 *   - Footnote auto-numbering + click-to-popover
 *   - Dictionary popover for `.dsg-define`
 *   - Bookmark ribbon (per-URL, persisted in localStorage)
 *   - Aa cycler (font size + light/dark theme)
 *   - Reading progress bar + faux Loc + estimated time-left
 *   - Live clock + chapter-jump arrows + keyboard shortcuts
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

	// --------- bookmark ribbon ---------
	function ensureBookmark() {
		var bm = document.getElementById( 'dsg-bookmark' );
		if ( bm ) {
			return bm;
		}
		bm = document.createElement( 'button' );
		bm.id = 'dsg-bookmark';
		bm.type = 'button';
		bm.className = 'dsg-bookmark';
		bm.setAttribute( 'aria-label', 'Bookmark this page' );
		bm.innerHTML = '<svg viewBox="0 0 24 56" fill="currentColor" aria-hidden="true"><path d="M0 0 L24 0 L24 56 L12 46 L0 56 Z"/></svg>';
		document.body.appendChild( bm );
		return bm;
	}
	function wireBookmark() {
		var bm = ensureBookmark();
		var key = 'dsg-bookmark-' + window.location.pathname;
		function set( on ) {
			bm.classList.toggle( 'is-active', !! on );
			try { localStorage.setItem( key, on ? '1' : '0' ); } catch ( e ) { /* noop */ }
		}
		try { set( localStorage.getItem( key ) === '1' ); } catch ( e ) { /* noop */ }
		bm.addEventListener( 'click', function () {
			set( ! bm.classList.contains( 'is-active' ) );
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
		left.addEventListener( 'click', function () { jumpSection( -1 ); } );
		right.addEventListener( 'click', function () { jumpSection( 1 ); } );
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

	// --------- Aa cycle ---------
	function wireAa() {
		var btn = document.getElementById( 'dsg-aa-btn' );
		if ( ! btn ) {
			return;
		}
		var sizes = [ 16, 17, 18, 20, 22 ];
		var themes = [ 'light', 'dark' ];
		var sIdx = readInt( 'dsg-ebook-size-idx', 2, sizes.length );
		var tIdx = readInt( 'dsg-ebook-theme-idx', 0, themes.length );
		apply();
		btn.addEventListener( 'click', function () {
			sIdx++;
			if ( sIdx >= sizes.length ) {
				sIdx = 2;
				tIdx = ( tIdx + 1 ) % themes.length;
			}
			apply();
		} );
		function apply() {
			document.body.style.fontSize = sizes[ sIdx ] + 'px';
			document.documentElement.setAttribute( 'data-theme', themes[ tIdx ] );
			try {
				localStorage.setItem( 'dsg-ebook-size-idx', String( sIdx ) );
				localStorage.setItem( 'dsg-ebook-theme-idx', String( tIdx ) );
			} catch ( e ) { /* noop */ }
		}
	}

	// --------- reading progress + Loc + time left ---------
	function wireProgress() {
		var fill = document.getElementById( 'dsg-fill' );
		var pct = document.getElementById( 'dsg-pct' );
		var loc = document.getElementById( 'dsg-loc' );
		var timeLeft = document.getElementById( 'dsg-time-left' );
		if ( ! fill ) {
			return;
		}
		// Faux locations: 12 "locations" per ~100 vertical pixels of content.
		var totalLoc = Math.max( 200, Math.round( document.documentElement.scrollHeight / 8 ) );
		// Reading time from the visible chapter text, with sensible floor.
		var totalMin = readingTimeFor( document.querySelector( '.dsg-chapter-content, .dsg-archive, .dsg-cover' ) ) || 4;

		function fmt( m ) {
			if ( m < 1 ) { return 'a moment left'; }
			if ( m < 60 ) { return 'about ' + Math.round( m ) + 'm left'; }
			var h = Math.floor( m / 60 );
			var mm = Math.round( m - h * 60 );
			return 'about ' + h + 'h ' + mm + 'm left';
		}
		function update() {
			var doc = document.documentElement;
			var max = ( doc.scrollHeight - window.innerHeight ) || 1;
			var p = Math.min( 1, Math.max( 0, window.scrollY / max ) );
			fill.style.width = ( p * 100 ).toFixed( 1 ) + '%';
			if ( pct ) { pct.textContent = Math.round( p * 100 ) + '%'; }
			if ( loc ) {
				loc.textContent =
					'Loc ' + Math.max( 1, Math.round( p * totalLoc ) ) +
					' of ' + totalLoc.toLocaleString();
			}
			if ( timeLeft ) { timeLeft.textContent = fmt( totalMin * ( 1 - p ) ); }
		}
		window.addEventListener( 'scroll', update, { passive: true } );
		window.addEventListener( 'resize', update );
		update();
	}
	function readingTimeFor( el ) {
		if ( ! el ) { return 0; }
		var text = ( el.textContent || '' ).trim();
		if ( ! text ) { return 0; }
		var words = text.split( /\s+/ ).length;
		return Math.max( 1, Math.round( words / 220 ) );
	}

	// --------- live clock ---------
	function wireClock() {
		var c = document.getElementById( 'dsg-clock' );
		if ( ! c ) { return; }
		function tick() {
			var d = new Date();
			var h = d.getHours() % 12;
			if ( h === 0 ) { h = 12; }
			var m = d.getMinutes();
			c.textContent = h + ':' + ( m < 10 ? '0' + m : m );
		}
		tick();
		setInterval( tick, 30 * 1000 );
	}

	// --------- keyboard shortcuts ---------
	function wireKeyboard() {
		document.addEventListener( 'keydown', function ( e ) {
			if ( e.target.closest( 'input, textarea, [contenteditable]' ) ) { return; }
			if ( e.key === 'ArrowLeft' || e.key === 'PageUp' ) {
				jumpSection( -1 );
			} else if ( e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' ) {
				e.preventDefault();
				jumpSection( 1 );
			} else if ( e.key === 'Escape' ) {
				hidePopover();
			} else if ( e.key === 'b' && ( e.metaKey || e.ctrlKey ) ) {
				e.preventDefault();
				var bm = document.getElementById( 'dsg-bookmark' );
				if ( bm ) { bm.click(); }
			}
		} );
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
		ensureBookmark();
		ensurePageTurns();
		wireFootnotes();
		wireDefine();
		wireBookmark();
		wireAa();
		wireProgress();
		wireClock();
		wireKeyboard();
		wireDismiss();
	}
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )();
