<?php
/**
 * Title: Homepage reader
 * Slug: dsg-ereader/homepage-reader
 * Categories: featured
 *
 * @package DSG_Ereader
 */
?>
<!-- wp:group {"tagName":"main","className":"dsg-main","layout":{"type":"default"}} -->
<main class="wp-block-group dsg-main">

	<!-- wp:dsg/book-cover {"edition":"Digital Edition · 2026 · Self-Published","title":"Collected\nWorks","useSiteTagline":true,"authorLabel":"written by","authorName":"DEREK SMART-GORDON","metaItems":["essays & projects","selected works","assembled in Portland, Maine"]} /-->

	<!-- wp:dsg/contents {"id":"contents","heading":"Contents","items":[{"label":"i.","href":"#about","title":"About the Author","subtitle":"a short, mostly accurate biography","marker":"page"},{"label":"ii.","href":"#works","title":"Selected Works","subtitle":"projects worth pointing at","marker":"page"},{"label":"iii.","href":"#essays","title":"Essays","subtitle":"occasional writing, in reverse chronological","marker":"posts"},{"label":"iv.","href":"#coda","title":"Coda","subtitle":"where to find me, how to get in touch","marker":"end"}]} /-->

	<!-- wp:dsg/page-chapter {"slug":"about","id":"about","chapter":"Chapter One","title":"About the Author","dek":"a short, mostly accurate biography"} /-->

	<!-- wp:dsg/projects-chapter {"slug":"projects","id":"works","chapter":"Chapter Two","title":"Selected Works","dek":"projects worth pointing at"} /-->

	<!-- wp:group {"className":"dsg-essays-block","layout":{"type":"constrained"}} -->
	<div id="essays" class="wp-block-group dsg-essays-block">

		<!-- wp:paragraph {"align":"center","className":"dsg-chapter-num"} -->
		<p class="has-text-align-center dsg-chapter-num">Chapter Three</p>
		<!-- /wp:paragraph -->

		<!-- wp:heading {"level":2,"className":"dsg-chapter-title","textAlign":"center"} -->
		<h2 class="wp-block-heading has-text-align-center dsg-chapter-title">Essays</h2>
		<!-- /wp:heading -->

		<!-- wp:paragraph {"align":"center","className":"dsg-chapter-dek"} -->
		<p class="has-text-align-center dsg-chapter-dek">occasional writing, in reverse chronological</p>
		<!-- /wp:paragraph -->

		<!-- wp:query {"queryId":1,"query":{"perPage":5,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","sticky":"","inherit":false}} -->
		<div class="wp-block-query">

			<!-- wp:post-template {"className":"dsg-essays"} -->

				<!-- wp:group {"className":"dsg-essay-row","layout":{"type":"flex","justifyContent":"space-between","verticalAlignment":"baseline","flexWrap":"nowrap"}} -->
				<div class="wp-block-group dsg-essay-row">
					<!-- wp:post-title {"isLink":true,"className":"dsg-essay-title","level":3} /-->
					<!-- wp:post-date {"className":"dsg-essay-date","format":"M Y"} /-->
				</div>
				<!-- /wp:group -->

			<!-- /wp:post-template -->

			<!-- wp:query-no-results -->
				<!-- wp:paragraph {"align":"center","className":"dsg-essay-empty"} -->
				<p class="has-text-align-center dsg-essay-empty">No essays yet — watch this space.</p>
				<!-- /wp:paragraph -->
			<!-- /wp:query-no-results -->

		</div>
		<!-- /wp:query -->

	</div>
	<!-- /wp:group -->

	<!-- wp:group {"tagName":"section","className":"dsg-chapter dsg-coda","layout":{"type":"constrained"}} -->
	<section id="coda" class="wp-block-group dsg-chapter dsg-coda">

		<!-- wp:paragraph {"align":"center","className":"dsg-chapter-num"} -->
		<p class="has-text-align-center dsg-chapter-num">Coda</p>
		<!-- /wp:paragraph -->

		<!-- wp:heading {"level":2,"textAlign":"center","className":"dsg-chapter-title"} -->
		<h2 class="wp-block-heading has-text-align-center dsg-chapter-title">Where to find me</h2>
		<!-- /wp:heading -->

		<!-- wp:paragraph {"align":"center","className":"dsg-chapter-dek"} -->
		<p class="has-text-align-center dsg-chapter-dek">brief and to the point</p>
		<!-- /wp:paragraph -->

		<!-- wp:paragraph {"align":"center","className":"dsg-coda-note"} -->
		<p class="has-text-align-center dsg-coda-note">If anything in here struck you, I'd like to hear about it.</p>
		<!-- /wp:paragraph -->

		<!-- wp:paragraph {"align":"center","className":"dsg-coda-links"} -->
		<p class="has-text-align-center dsg-coda-links"><a href="mailto:smart@automattic.com">smart@automattic.com</a> · <a href="https://github.com/dereksmart">github</a> · <a href="https://www.linkedin.com/in/derek-smart/">linkedin</a></p>
		<!-- /wp:paragraph -->

		<!-- wp:html -->
		<div class="dsg-ornament" aria-hidden="true">FIN.</div>
		<!-- /wp:html -->

	</section>
	<!-- /wp:group -->

</main>
<!-- /wp:group -->
