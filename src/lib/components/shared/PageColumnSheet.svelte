<!--
  The centre island: a white surface under the page content plus the frame that
  rounds its corners. Both trace the same rectangle (the --island-* vars in app.css,
  which also drive the body padding), so the content, its surface and its edge can
  never drift apart.

  `bg-card`, not `bg-background`: --background is 96% grey and the point is a white
  page. A banded list still sits on a `bg-card` sheet; this is that sheet.

  The frame sits above the page content because the page scrolls the document, not
  this surface, so the surface can't clip its own corners (see .shell-frame).
-->
<div aria-hidden="true" class="page-column-sheet bg-card print:hidden"></div>
<div aria-hidden="true" class="shell-frame"></div>
