(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function markFontsReady() {
    var root = document.documentElement;
    function showNav() {
      root.classList.add("fonts-ready");
    }

    if (document.fonts && document.fonts.load) {
      Promise.race([
        document.fonts.load('400 16px "Open Sans"'),
        new Promise(function (resolve) {
          setTimeout(resolve, 1200);
        })
      ]).then(showNav).catch(showNav);
    } else {
      showNav();
    }
  }

  function setupAudioControls() {
    var audioTrack = document.getElementById("track");
    if (!audioTrack) {
      return;
    }

    var playButtons = Array.prototype.slice.call(document.querySelectorAll(".play-audio"));
    var pauseButtons = Array.prototype.slice.call(document.querySelectorAll(".pause-audio"));

    function setPlayingUI(isPlaying) {
      playButtons.forEach(function (btn) {
        btn.style.display = isPlaying ? "none" : "flex";
      });
      pauseButtons.forEach(function (btn) {
        btn.style.display = isPlaying ? "flex" : "none";
      });
    }

    function togglePlayback(event) {
      if (event) {
        event.preventDefault();
      }
      if (audioTrack.paused) {
        audioTrack.play().then(function () {
          setPlayingUI(true);
        }).catch(function () {
          setPlayingUI(false);
        });
      } else {
        audioTrack.pause();
        setPlayingUI(false);
      }
    }

    playButtons.forEach(function (btn) {
      btn.addEventListener("click", togglePlayback);
    });

    pauseButtons.forEach(function (btn) {
      btn.addEventListener("click", togglePlayback);
    });

    audioTrack.addEventListener("ended", function () {
      setPlayingUI(false);
    });
  }

  function setupQrVisibility() {
    var params = new URLSearchParams(window.location.search);
    if (params.has("qr")) {
      return;
    }

    document.querySelectorAll(".ar-button").forEach(function (el) {
      el.style.display = "none";
    });
  }

  function setupAnchorPrevention() {
    document.addEventListener("click", function (event) {
      var target = event.target.closest("a.play-audio, a.pause-audio, a.pop-up-close");
      if (!target) {
        return;
      }
      event.preventDefault();
    });
  }

  function setupHeroVariantLazyLoader() {
    function hydrate(wrapper) {
      if (!wrapper) {
        return;
      }
      wrapper.querySelectorAll("img").forEach(function (img) {
        var src = img.getAttribute("data-src");
        var srcset = img.getAttribute("data-srcset");

        if (src && img.getAttribute("src") !== src) {
          img.setAttribute("src", src);
        }
        if (srcset) {
          img.setAttribute("srcset", srcset);
        }
        if (!img.hasAttribute("loading")) {
          img.setAttribute("loading", "lazy");
        }
      });
    }

    function apply() {
      var mobile = window.matchMedia("(max-width: 991px)").matches;
      var variant = mobile ? "mobile" : "desktop";
      document.querySelectorAll('.heroheader05_image-wrapper[data-hero-variant="' + variant + '"]').forEach(hydrate);
    }

    apply();
    window.addEventListener("resize", apply, { passive: true });
  }

  function setupLegacyHtmlRedirect() {
    var path = window.location.pathname || "";
    if (/\.html$/i.test(path)) {
      var target = path.replace(/\.html$/i, "/");
      window.location.replace(target + (window.location.search || "") + (window.location.hash || ""));
    }
  }

  function setupVremeplovTimeline() {
    var page = document.querySelector(".page-vremeplov");
    if (!page) {
      return;
    }
    document.body.classList.add("is-vremeplov-page");

    var markers = Array.prototype.slice.call(page.querySelectorAll(".mk[data-target]"));
    var steps = Array.prototype.slice.call(page.querySelectorAll(".vtimeline-step[data-id]"));

    if (markers.length === 0 || steps.length === 0) {
      return;
    }

    function normalizeInfoBoxTitleMain(rawTitle) {
      if (!rawTitle) {
        return "";
      }
      return rawTitle.replace(/\s+[–-]\s+.+$/, "").trim();
    }

    steps.forEach(function (step) {
      var titleMainEl = step.querySelector(".infoBox__title-main");
      var subtitleEl = step.querySelector(".infoBox__subtitle");
      if (!titleMainEl || !subtitleEl) {
        return;
      }
      var cleaned = normalizeInfoBoxTitleMain(titleMainEl.textContent || "");
      if (cleaned) {
        titleMainEl.textContent = cleaned;
      }
    });

    var lastToplineHeight = 120;

    function syncToplineOffset() {
      var navbar = document.querySelector(".siteNav") || document.querySelector(".navbar07_component");
      var navbarRect = navbar ? navbar.getBoundingClientRect() : null;
      var navbarRectHeight = navbarRect ? Math.ceil(navbarRect.height) : 0;
      var navbarOffsetHeight = navbar ? Math.ceil(navbar.offsetHeight || 0) : 0;
      var offset = Math.max(80, navbarRectHeight, navbarOffsetHeight);
      var topline = page.querySelector(".timelineSticky");
      var toplineHeight = 0;
      if (topline) {
        var rectHeight = Math.ceil(topline.getBoundingClientRect().height || 0);
        var offsetHeight = Math.ceil(topline.offsetHeight || 0);
        var scrollHeight = Math.ceil(topline.scrollHeight || 0);
        toplineHeight = Math.max(rectHeight, offsetHeight, scrollHeight);
      }

      if (toplineHeight < 40) {
        toplineHeight = lastToplineHeight;
      } else {
        lastToplineHeight = toplineHeight;
      }

      document.documentElement.style.setProperty("--nav-h", offset + "px");
      document.documentElement.style.setProperty("--topline-offset", offset + "px");
      document.documentElement.style.setProperty("--topline-height", toplineHeight + "px");
    }

    var connectorRaf = null;
    var connectorResizeObserver = null;

    function scheduleToplineConnectorsLayout() {
      if (connectorRaf !== null) {
        return;
      }
      connectorRaf = window.requestAnimationFrame(function () {
        connectorRaf = null;
        layoutToplineConnectors();
      });
    }

    function layoutToplineConnectors() {
      var toplineContainer = page.querySelector(".timelineSticky .topline .container-large-2") || page.querySelector(".topline .container-large-2");
      if (!toplineContainer) {
        return;
      }
      var toplineScroller = toplineContainer.querySelector(".topline__scroller") || toplineContainer;
      var toplineTrack = toplineScroller.querySelector(".topline__track");
      var toplineDurationWrap = toplineScroller.querySelector(".topline__durationWrap");
      var toplineDurationBar = toplineScroller.querySelector(".topline__durationBar");
      var toplineBus = toplineScroller.querySelector(".topline__bus");
      var busSvg = toplineBus ? toplineBus.querySelector(".topline__busSvg") : null;

      if (!toplineTrack || !toplineDurationWrap || !toplineDurationBar || !toplineBus || !busSvg) {
        return;
      }

      if (window.matchMedia("(max-width: 900px)").matches) {
        var trackWidth = Math.max(1, Math.round(toplineTrack.scrollWidth));
        toplineDurationWrap.style.minWidth = trackWidth + "px";
        toplineDurationBar.style.minWidth = trackWidth + "px";
        toplineBus.style.minWidth = trackWidth + "px";
      } else {
        toplineDurationWrap.style.minWidth = "";
        toplineDurationBar.style.minWidth = "";
        toplineBus.style.minWidth = "";
      }

      var segmentEls = Array.prototype.slice.call(toplineScroller.querySelectorAll(".topline__segment[data-seg]"));
      var durationEls = Array.prototype.slice.call(toplineScroller.querySelectorAll(".topline__durationBar .durationBar__seg"));
      if (segmentEls.length === 0 || durationEls.length === 0) {
        while (busSvg.firstChild) {
          busSvg.removeChild(busSvg.firstChild);
        }
        return;
      }

      toplineBus.style.width = toplineTrack.scrollWidth + "px";
      var busRect = toplineBus.getBoundingClientRect();
      var busWidth = Math.max(1, Math.round(busRect.width));
      var busHeight = Math.max(1, Math.round(busRect.height));
      busSvg.setAttribute("viewBox", "0 0 " + busWidth + " " + busHeight);
      busSvg.setAttribute("preserveAspectRatio", "none");

      while (busSvg.children.length > segmentEls.length) {
        busSvg.removeChild(busSvg.lastChild);
      }
      while (busSvg.children.length < segmentEls.length) {
        var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("class", "topline__connector");
        busSvg.appendChild(path);
      }

      var lanes = segmentEls.length;
      // Keep lane spacing even, but reserve bottom inset so the last
      // connector does not sit too close to the segment box (purple vs red).
      var yTopInset = 12;
      var yBottomInset = 16;
      var laneSpan = Math.max(1, busHeight - yTopInset - yBottomInset);
      var laneStep = lanes > 1 ? laneSpan / (lanes - 1) : 0;

      segmentEls.forEach(function (segmentEl, index) {
        var segKey = segmentEl.getAttribute("data-seg") || "";
        var durationEl = durationEls[index];
        var pathEl = busSvg.children[index];
        if (!durationEl || !pathEl) {
          return;
        }

        pathEl.setAttribute("class", "topline__connector seg--" + segKey);

        var blockRect = segmentEl.getBoundingClientRect();
        var topRect = durationEl.getBoundingClientRect();
        // Keep authored segment widths from template/CSS in both modes.
        segmentEl.style.removeProperty("--seg-ratio");

        var xTop = topRect.left + (topRect.width / 2) - busRect.left;
        var xBlock = blockRect.left + (blockRect.width / 2) - busRect.left;
        var yLane = Math.round(yTopInset + (index * laneStep));

        var d = "M " + xBlock + " " + busHeight +
          " L " + xBlock + " " + yLane +
          " L " + xTop + " " + yLane +
          " L " + xTop + " 0";

        // Inline stroke attributes keep connectors visible even if a global CSS rule
        // accidentally overrides SVG path styling.
        var varName = "--seg-" + segKey;
        var resolvedStroke = window.getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        if (!resolvedStroke) {
          resolvedStroke = "rgba(92, 96, 104, 0.9)";
        }
        pathEl.setAttribute("fill", "none");
        pathEl.setAttribute("stroke", resolvedStroke);
        pathEl.setAttribute("stroke-width", "2.2");
        pathEl.setAttribute("stroke-linecap", "round");
        pathEl.setAttribute("stroke-linejoin", "round");
        pathEl.setAttribute("opacity", "1");
        pathEl.setAttribute("d", d);
      });
    }

    function setActiveMarker(id) {
      markers.forEach(function (mk) {
        mk.classList.toggle("is-active", mk.getAttribute("data-target") === id);
      });
      scheduleToplineConnectorsLayout();
    }

    function layoutToplineLabels() {
      var lines = Array.prototype.slice.call(page.querySelectorAll(".seg__line"));
      var isMobile = window.matchMedia("(max-width: 900px)").matches;
      var labelOffset = isMobile ? -28 : -32;
      var pairNudgePx = isMobile ? 8 : 12;
      var clusterNudgePx = isMobile ? 14 : 18;

      lines.forEach(function (line) {
        var lineMarkers = Array.prototype.slice.call(line.querySelectorAll(".mk[data-target]"));
        var lineWidth = Math.max(1, Math.round(line.getBoundingClientRect().width || line.clientWidth || 1));
        var nudgeMap = new Map();

        lineMarkers.sort(function (a, b) {
          var leftA = parseFloat((a.style.left || "0").replace("%", "")) || 0;
          var leftB = parseFloat((b.style.left || "0").replace("%", "")) || 0;
          return leftA - leftB;
        });

        for (var i = 0; i < lineMarkers.length - 1; i += 1) {
          var currentMk = lineMarkers[i];
          var nextMk = lineMarkers[i + 1];
          var currentLeftPx = ((parseFloat((currentMk.style.left || "0").replace("%", "")) || 0) / 100) * lineWidth;
          var nextLeftPx = ((parseFloat((nextMk.style.left || "0").replace("%", "")) || 0) / 100) * lineWidth;
          var gapPx = Math.abs(nextLeftPx - currentLeftPx);
          if (gapPx < 18) {
            nudgeMap.set(currentMk, (nudgeMap.get(currentMk) || 0) - clusterNudgePx);
            nudgeMap.set(nextMk, (nudgeMap.get(nextMk) || 0) + clusterNudgePx);
          } else if (gapPx < 30) {
            nudgeMap.set(currentMk, (nudgeMap.get(currentMk) || 0) - pairNudgePx);
            nudgeMap.set(nextMk, (nudgeMap.get(nextMk) || 0) + pairNudgePx);
          }
        }

        lineMarkers.forEach(function (mk) {
          mk.classList.remove("mk--compact");
          mk.classList.remove("mk--dense");
          mk.classList.remove("mk--tight");
          mk.classList.remove("is-edge-left");
          mk.classList.remove("is-edge-right");
          mk.classList.remove("mk--below");
          mk.classList.add("mk--above");
          mk.style.setProperty("--mk-nudge", (nudgeMap.get(mk) || 0) + "px");
          mk.style.setProperty("--mk-label-offset", labelOffset + "px");
          mk.style.setProperty("--mk-line-size", "0px");

          var labelEl = mk.querySelector(".mk__label");
          if (labelEl) {
            labelEl.removeAttribute("hidden");
            labelEl.removeAttribute("aria-hidden");
          }

          var left = parseFloat((mk.style.left || "0").replace("%", "")) || 0;
          if (left <= 6) {
            mk.classList.add("is-edge-left");
          } else if (left >= 94) {
            mk.classList.add("is-edge-right");
          }
        });
      });
    }

    function layoutDurationScaleLabels() {
      var scales = Array.prototype.slice.call(page.querySelectorAll(".topline__durationScale"));
      scales.forEach(function (scale) {
        var labels = Array.prototype.slice.call(scale.querySelectorAll(".durationScale__label"));
        if (labels.length < 2) {
          return;
        }

        labels.sort(function (a, b) {
          var leftA = parseFloat((a.style.left || "0").replace("%", "")) || 0;
          var leftB = parseFloat((b.style.left || "0").replace("%", "")) || 0;
          return leftA - leftB;
        });

        labels.forEach(function (label) {
          label.style.setProperty("--nudge-x", "0px");
          label.style.setProperty("--nudge-y", "0px");
        });

        var denseThreshold = 3.8;
        var cluster = [];

        function flushCluster() {
          if (cluster.length < 2) {
            cluster = [];
            return;
          }

          var count = cluster.length;
          var xStep = 12;
          var yStep = 10;
          cluster.forEach(function (label, idx) {
            var xNudge = (idx - ((count - 1) / 2)) * xStep;
            var yNudge = (idx % 2) * yStep;
            label.style.setProperty("--nudge-x", xNudge + "px");
            label.style.setProperty("--nudge-y", yNudge + "px");
          });
          cluster = [];
        }

        for (var i = 0; i < labels.length; i += 1) {
          if (cluster.length === 0) {
            cluster.push(labels[i]);
            continue;
          }

          var prev = cluster[cluster.length - 1];
          var leftPrev = parseFloat((prev.style.left || "0").replace("%", "")) || 0;
          var leftCur = parseFloat((labels[i].style.left || "0").replace("%", "")) || 0;

          if (Math.abs(leftCur - leftPrev) <= denseThreshold) {
            cluster.push(labels[i]);
          } else {
            flushCluster();
            cluster.push(labels[i]);
          }
        }
        flushCluster();
      });
    }

    function normalizeTimelineYearLabel(html) {
      return String(html || "")
        .replace(/(\d{3,4})\.(?=\s*(?:&ndash;|&#8211;|–|-))/g, "$1")
        .replace(/(\d{3,4})\.(?=\s*(?:<br\s*\/?>|<\/span>|$))/g, "$1");
    }

    function normalizeSegmentRangeLabels() {
      var ranges = Array.prototype.slice.call(page.querySelectorAll(".seg__range"));
      ranges.forEach(function (range) {
        if (range.querySelector(".seg__range-split")) {
          return;
        }

        var stack = range.querySelector(".seg__range-stack");
        if (stack) {
          var stackParts = Array.prototype.slice.call(stack.querySelectorAll("span")).map(function (el) {
            return (el.textContent || "").trim();
          }).filter(Boolean);
          if (stackParts.length >= 2) {
            range.innerHTML = '<span class="seg__range-flat"><span class="seg__range-flat-left">' +
              stackParts[0] + '</span><span class="seg__range-flat-right">' + stackParts[1] + "</span></span>";
          }
          return;
        }

        var raw = (range.textContent || "").replace(/\s+/g, " ").trim();
        if (!raw) {
          return;
        }
        var parts = raw.split(/\s*[–-]\s*/);
        if (parts.length >= 2) {
          var left = parts[0].trim();
          var right = parts.slice(1).join(" - ").trim();
          range.innerHTML = '<span class="seg__range-flat"><span class="seg__range-flat-left">' +
            left + '</span><span class="seg__range-flat-right">' + right + "</span></span>";
        }
      });
    }

    syncToplineOffset();
    markers.forEach(function (mk) {
      var label = mk.querySelector(".mk__label");
      if (!label) {
        return;
      }
      label.innerHTML = normalizeTimelineYearLabel(label.innerHTML);
    });
    steps.forEach(function (step) {
      var axisYear = step.querySelector(".vtimeline-step__axisYear");
      if (!axisYear) {
        return;
      }
      axisYear.innerHTML = normalizeTimelineYearLabel(axisYear.innerHTML);
    });
    normalizeSegmentRangeLabels();
    layoutToplineLabels();
    layoutDurationScaleLabels();
    layoutToplineConnectors();
    window.addEventListener("resize", syncToplineOffset, { passive: true });
    window.addEventListener("resize", layoutToplineLabels, { passive: true });
    window.addEventListener("resize", layoutDurationScaleLabels, { passive: true });
    window.addEventListener("resize", scheduleToplineConnectorsLayout, { passive: true });
    window.addEventListener("resize", scheduleActiveSyncFromViewport, { passive: true });
    window.addEventListener("scroll", scheduleActiveSyncFromViewport, { passive: true });

    (function setupToplineConnectorObservers() {
      var toplineContainer = page.querySelector(".timelineSticky .topline .container-large-2") || page.querySelector(".topline .container-large-2");
      if (!toplineContainer) {
        return;
      }
      var toplineScroller = toplineContainer.querySelector(".topline__scroller") || toplineContainer;
      if (window.ResizeObserver) {
        connectorResizeObserver = new ResizeObserver(function () {
          scheduleToplineConnectorsLayout();
        });
        connectorResizeObserver.observe(toplineScroller);
        var durationBar = toplineScroller.querySelector(".topline__durationBar");
        var track = toplineScroller.querySelector(".topline__track");
        if (durationBar) {
          connectorResizeObserver.observe(durationBar);
        }
        if (track) {
          connectorResizeObserver.observe(track);
        }
      }

      toplineScroller.addEventListener("scroll", scheduleToplineConnectorsLayout, { passive: true });
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
          scheduleToplineConnectorsLayout();
        }).catch(function () {
          scheduleToplineConnectorsLayout();
        });
      }
    })();

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function getViewportStoryAnchorY() {
      var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--topline-offset"), 10) || 80;
      var toplineH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--topline-height"), 10) || 120;
      var visibleTop = navH + toplineH;
      return visibleTop + (window.matchMedia("(max-width: 900px)").matches ? 20 : 22);
    }

    function getDocTop(step) {
      var rect = step.getBoundingClientRect();
      return window.scrollY + rect.top;
    }

    function getStepFocusTop(step) {
      return Math.max(0, getDocTop(step) - getViewportStoryAnchorY());
    }

    function findActiveStepIndex(anchorDocY) {
      var activeIndex = 0;
      steps.forEach(function (step, index) {
        if (getDocTop(step) <= anchorDocY) {
          activeIndex = index;
        }
      });
      return activeIndex;
    }

    var timelineState = "idle";
    var currentSnapIndex = 0;
    var transitionTimers = [];
    var touchStartY = null;
    var touchStartX = null;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function getTimelineConfig() {
      var reduced = reduceMotion.matches;
      return {
        transitionMs: reduced ? 120 : 1200,
        lockMs: reduced ? 120 : 1200,
        wheelThreshold: 1,
        swipeThreshold: 28
      };
    }

    function clearTransitionTimers() {
      transitionTimers.forEach(function (timer) {
        window.clearTimeout(timer);
      });
      transitionTimers = [];
    }

    function resetTransientClasses() {
      steps.forEach(function (step) {
        step.classList.remove("is-outgoing");
        step.classList.remove("is-incoming");
        step.classList.remove("is-text-bg-in");
        step.classList.remove("is-text-content-in");
      });
    }

    function applyStepVisibility() {
      steps.forEach(function (step, index) {
        var info = step.querySelector("[data-info]");
        var isCurrent = index === currentSnapIndex;
        step.classList.toggle("is-active", isCurrent);
        step.classList.toggle("is-current", isCurrent);
        if (!info) {
          return;
        }
        if (isCurrent) {
          info.removeAttribute("hidden");
        } else {
          info.setAttribute("hidden", "");
        }
      });
    }

    function updatePageState() {
      var activeStep = steps[currentSnapIndex];
      var activeId = activeStep ? (activeStep.getAttribute("data-id") || "") : "";
      page.setAttribute("data-timeline-state", timelineState);
      page.setAttribute("data-active-step", activeId);
    }

    function commitStep(index, shouldSetHash) {
      currentSnapIndex = clamp(index, 0, steps.length - 1);
      var activeStep = steps[currentSnapIndex];
      var activeId = activeStep ? activeStep.getAttribute("data-id") : "";
      applyStepVisibility();
      if (activeId) {
        setActiveMarker(activeId);
        if (shouldSetHash !== false) {
          history.replaceState(null, "", "#" + activeId);
        }
      }
      updatePageState();
      scheduleToplineConnectorsLayout();
    }

    function syncActiveStepFromViewport() {
      if (timelineState !== "idle") {
        return;
      }
      syncToplineOffset();
      var anchorDocY = window.scrollY + getViewportStoryAnchorY();
      var activeIndex = findActiveStepIndex(anchorDocY);
      if (activeIndex !== currentSnapIndex) {
        commitStep(activeIndex, true);
      }
    }

    var syncActiveRaf = null;
    function scheduleActiveSyncFromViewport() {
      if (syncActiveRaf !== null) {
        return;
      }
      syncActiveRaf = window.requestAnimationFrame(function () {
        syncActiveRaf = null;
        syncActiveStepFromViewport();
      });
    }

    function scrollWindowToStep(index) {
      var step = steps[index];
      if (!step) {
        return;
      }
      syncToplineOffset();
      var targetTop = getStepFocusTop(step);
      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: "auto"
      });
    }

    function scrollToFooterFromTimeline() {
      var footer = document.querySelector("section.footer");
      if (!footer) {
        return;
      }
      var footerTop = window.scrollY + footer.getBoundingClientRect().top;
      timelineState = "animating";
      updatePageState();
      window.scrollTo({
        top: Math.max(0, footerTop),
        behavior: "smooth"
      });
      window.setTimeout(function () {
        timelineState = "idle";
        updatePageState();
      }, Math.max(320, getTimelineConfig().lockMs));
    }

    function animateToIndex(targetIndex, options) {
      var opts = options || {};
      var nextIndex = clamp(targetIndex, 0, steps.length - 1);
      var prevIndex = currentSnapIndex;
      if (nextIndex === prevIndex && !opts.force) {
        return;
      }
      if (timelineState === "animating" && !opts.force) {
        return;
      }

      clearTransitionTimers();
      resetTransientClasses();
      timelineState = "animating";
      updatePageState();

      var config = getTimelineConfig();
      var outgoingStep = steps[prevIndex];
      var incomingStep = steps[nextIndex];
      if (outgoingStep && outgoingStep !== incomingStep) {
        outgoingStep.classList.add("is-outgoing");
      }
      if (incomingStep) {
        incomingStep.classList.add("is-incoming");
      }

      currentSnapIndex = nextIndex;
      commitStep(nextIndex, opts.updateHash !== false);
      scrollWindowToStep(nextIndex);

      if (incomingStep) {
        transitionTimers.push(window.setTimeout(function () {
          incomingStep.classList.add("is-text-bg-in");
        }, Math.min(60, config.transitionMs)));

        transitionTimers.push(window.setTimeout(function () {
          incomingStep.classList.add("is-text-content-in");
        }, Math.min(180, config.transitionMs)));
      }

      transitionTimers.push(window.setTimeout(function () {
        resetTransientClasses();
        timelineState = "idle";
        updatePageState();
      }, config.lockMs));
    }

    function activateStepById(id, shouldAnimate, shouldSetHash) {
      if (!id) {
        return;
      }
      var targetIndex = steps.findIndex(function (step) {
        return step.getAttribute("data-id") === id;
      });
      if (targetIndex === -1) {
        return;
      }
      if (shouldAnimate === false) {
        clearTransitionTimers();
        resetTransientClasses();
        timelineState = "idle";
        commitStep(targetIndex, shouldSetHash !== false);
        scrollWindowToStep(targetIndex);
        updatePageState();
        return;
      }
      animateToIndex(targetIndex, { updateHash: shouldSetHash !== false });
    }

    page.addEventListener("click", function (event) {
      var mk = event.target.closest(".mk[data-target]");
      if (mk) {
        event.preventDefault();
        event.stopPropagation();
        if (timelineState === "animating") {
          return;
        }
        activateStepById(mk.getAttribute("data-target"), true, true);
        return;
      }

    });

    function shouldUseStepSnapNavigation() {
      return true;
    }

    function jumpToAdjacentStep(direction) {
      if (timelineState === "animating") {
        return;
      }
      var nextIndex = clamp(currentSnapIndex + direction, 0, steps.length - 1);
      if (nextIndex === currentSnapIndex) {
        if (direction > 0 && currentSnapIndex === steps.length - 1) {
          scrollToFooterFromTimeline();
        }
        return;
      }
      animateToIndex(nextIndex, { updateHash: true });
    }

    function isWithinTimelineStory() {
      var firstStep = steps[0];
      var lastStep = steps[steps.length - 1];
      if (!firstStep || !lastStep) {
        return false;
      }
      var startY = getDocTop(firstStep) - window.innerHeight * 0.2;
      var endY = getDocTop(lastStep) + lastStep.offsetHeight - window.innerHeight * 0.55;
      return window.scrollY >= startY && window.scrollY <= endY;
    }

    function handleTimelineWheel(event) {
      if (!shouldUseStepSnapNavigation()) {
        return;
      }
      if (event.target && event.target.closest(".infoBox")) {
        return;
      }
      if (!isWithinTimelineStory()) {
        return;
      }

      // Within the timeline story we suppress native page scrolling and
      // only advance once the accumulated gesture is strong enough.
      event.preventDefault();

      if (timelineState === "animating") {
        return;
      }

      if (Math.abs(event.deltaY) < getTimelineConfig().wheelThreshold || event.deltaY === 0) {
        return;
      }

      jumpToAdjacentStep(event.deltaY > 0 ? 1 : -1);
    }

    document.addEventListener("wheel", handleTimelineWheel, { passive: false, capture: true });

    window.addEventListener("touchstart", function (event) {
      if (!event.touches || event.touches.length !== 1) {
        return;
      }
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    }, { passive: true });

    window.addEventListener("touchend", function (event) {
      if (!shouldUseStepSnapNavigation()) {
        touchStartX = null;
        touchStartY = null;
        return;
      }
      if (timelineState === "animating" || touchStartY === null || touchStartX === null || !event.changedTouches || event.changedTouches.length !== 1) {
        touchStartX = null;
        touchStartY = null;
        return;
      }

      var touch = event.changedTouches[0];
      var deltaY = touch.clientY - touchStartY;
      var deltaX = touch.clientX - touchStartX;
      touchStartX = null;
      touchStartY = null;

      var swipeThreshold = getTimelineConfig().swipeThreshold;
      if (Math.abs(deltaY) < swipeThreshold || Math.abs(deltaY) <= Math.abs(deltaX) * 1.05) {
        return;
      }
      if (touch.target && touch.target.closest(".infoBox")) {
        return;
      }
      if (!isWithinTimelineStory()) {
        return;
      }

      jumpToAdjacentStep(deltaY < 0 ? 1 : -1);
    }, { passive: true });

    window.addEventListener("hashchange", function () {
      var id = (window.location.hash || "").replace("#", "");
      if (!id) {
        return;
      }
      if (timelineState === "animating") {
        return;
      }
      activateStepById(id, true, false);
    });

    (function initFromHash() {
      var id = (window.location.hash || "").replace("#", "");
      if (id) {
        var hashIndex = steps.findIndex(function (step) {
          return step.getAttribute("data-id") === id;
        });
        if (hashIndex !== -1) {
          currentSnapIndex = hashIndex;
        }
        activateStepById(id, false, false);
      } else if (markers[0]) {
        var firstId = markers[0].getAttribute("data-target");
        activateStepById(firstId, false, true);
      }
      setTimeout(function () {
        syncToplineOffset();
        layoutDurationScaleLabels();
        scheduleToplineConnectorsLayout();
        scheduleActiveSyncFromViewport();
      }, 60);
    })();
  }

  function setupSingleOpenDropdown() {
    function closeDropdown(drop) {
      if (!drop) {
        return;
      }
      drop.classList.remove("w--open");
      var toggle = drop.querySelector(".w-dropdown-toggle");
      var list = drop.querySelector(".w-dropdown-list");

      if (toggle) {
        toggle.classList.remove("w--open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-haspopup", "menu");
      }

      if (list) {
        list.classList.remove("w--open");
        list.setAttribute("aria-hidden", "true");
      }
    }

    var root = document.querySelector(".navbar07_menu");
    if (!root) {
      return;
    }

    var drops = Array.prototype.slice.call(root.querySelectorAll(".navbar07_menu-dropdown.w-dropdown"));
    drops.forEach(function (drop) {
      drop.addEventListener("mouseenter", function () {
        drops.forEach(function (other) {
          if (other !== drop) {
            closeDropdown(other);
          }
        });
      });

      var toggle = drop.querySelector(".w-dropdown-toggle");
      if (toggle) {
        toggle.addEventListener("focus", function () {
          drops.forEach(function (other) {
            if (other !== drop) {
              closeDropdown(other);
            }
          });
        });
      }
    });
  }

  function setupFooterLoopVideo() {
    var videos = Array.prototype.slice.call(document.querySelectorAll("[data-footer-loop-video]"));
    if (!videos.length) {
      return;
    }

    function tryPlay(video) {
      video.muted = true;
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    }

    if (!("IntersectionObserver" in window)) {
      videos.forEach(function (video) {
        tryPlay(video);
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          tryPlay(video);
        } else {
          video.pause();
        }
      });
    }, {
      threshold: [0, 0.3, 0.6, 1]
    });

    videos.forEach(function (video) {
      observer.observe(video);
    });
  }

  function setupScrollRevealImages() {
    var images = Array.prototype.slice.call(document.querySelectorAll(".scroll-reveal-image"));
    if (!images.length) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      images.forEach(function (img) {
        img.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.2,
      rootMargin: "0px 0px -8% 0px"
    });

    images.forEach(function (img) {
      observer.observe(img);
    });
  }

  function setupFooterCircuitParallax() {
    var layer = document.querySelector(".footer-circuit-layer");
    var footer = document.querySelector("section.footer");
    if (!layer || !footer) {
      return;
    }

    var ticking = false;
    function update() {
      ticking = false;
      var rect = footer.getBoundingClientRect();
      var viewH = Math.max(window.innerHeight || 0, 1);
      var start = viewH;
      var end = -rect.height;
      var progress = (start - rect.top) / (start - end);
      progress = Math.max(0, Math.min(1, progress));
      var y = Math.round(progress * 36) - 18;
      layer.style.transform = "translate3d(0," + y + "px,0)";
    }

    function requestTick() {
      if (ticking) {
        return;
      }
      ticking = true;
      window.requestAnimationFrame(update);
    }

    requestTick();
    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick, { passive: true });
  }

  markFontsReady();
  setupLegacyHtmlRedirect();

  ready(function () {
    setupAudioControls();
    setupQrVisibility();
    setupAnchorPrevention();
    setupHeroVariantLazyLoader();
    setupSingleOpenDropdown();
    setupVremeplovTimeline();
    setupFooterLoopVideo();
    setupScrollRevealImages();
    setupFooterCircuitParallax();
  });
})();



