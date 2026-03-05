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

    var markers = Array.prototype.slice.call(page.querySelectorAll(".mk[data-target]"));
    var steps = Array.prototype.slice.call(page.querySelectorAll(".vtimeline-step[data-id]"));

    if (markers.length === 0 || steps.length === 0) {
      return;
    }

    var lightbox = page.querySelector("[data-vremeplov-lightbox]");
    var lightboxImage = lightbox ? lightbox.querySelector("[data-vremeplov-lightbox-image]") : null;
    var lightboxEra = lightbox ? lightbox.querySelector("[data-vremeplov-lightbox-era]") : null;
    var lightboxTitle = lightbox ? lightbox.querySelector("[data-vremeplov-lightbox-title]") : null;
    var lightboxDetail = lightbox ? lightbox.querySelector("[data-vremeplov-lightbox-detail]") : null;
    var lightboxOpen = false;

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

    var CONNECTOR_STEP_Y = 5;
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
      var toplineContainer = page.querySelector(".timelineSticky .container-large-2") || page.querySelector(".topline .container-large-2");
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
      var total = (lanes - 1) * CONNECTOR_STEP_Y;
      var y0 = Math.round((busHeight - total) / 2);

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

        var xTop = topRect.left + (topRect.width / 2) - busRect.left;
        var xBlock = blockRect.left + (blockRect.width / 2) - busRect.left;
        var yLane = y0 + (index * CONNECTOR_STEP_Y);

        var d = "M " + xTop + " 0" +
          " L " + xTop + " " + yLane +
          " L " + xBlock + " " + yLane +
          " L " + xBlock + " " + busHeight;

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
      var closeThresholdPercent = 8;
      var pairNudgePx = 8;

      lines.forEach(function (line) {
        var lineMarkers = Array.prototype.slice.call(line.querySelectorAll(".mk[data-target]"));
        if (lineMarkers.length < 2) {
          lineMarkers.forEach(function (mk) {
            mk.classList.remove("mk--compact");
            mk.classList.remove("is-edge-left");
            mk.classList.remove("is-edge-right");
            mk.style.setProperty("--mk-nudge", "0px");
          });
          return;
        }

        lineMarkers.sort(function (a, b) {
          var leftA = parseFloat((a.style.left || "0").replace("%", "")) || 0;
          var leftB = parseFloat((b.style.left || "0").replace("%", "")) || 0;
          return leftA - leftB;
        });

        var nudgeMap = new Map();
        lineMarkers.forEach(function (mk) {
          mk.classList.remove("mk--compact");
          mk.classList.remove("is-edge-left");
          mk.classList.remove("is-edge-right");
          nudgeMap.set(mk, 0);
        });

        for (var i = 0; i < lineMarkers.length - 1; i += 1) {
          var current = lineMarkers[i];
          var next = lineMarkers[i + 1];
          var currentLeft = parseFloat((current.style.left || "0").replace("%", "")) || 0;
          var nextLeft = parseFloat((next.style.left || "0").replace("%", "")) || 0;
          var distance = Math.abs(nextLeft - currentLeft);

          if (distance <= closeThresholdPercent) {
            current.classList.add("mk--compact");
            next.classList.add("mk--compact");
            nudgeMap.set(current, (nudgeMap.get(current) || 0) - pairNudgePx);
            nudgeMap.set(next, (nudgeMap.get(next) || 0) + pairNudgePx);
          }
        }

        lineMarkers.forEach(function (mk) {
          var left = parseFloat((mk.style.left || "0").replace("%", "")) || 0;
          if (left <= 6) {
            mk.classList.add("is-edge-left");
          } else if (left >= 94) {
            mk.classList.add("is-edge-right");
          }
          mk.style.setProperty("--mk-nudge", (nudgeMap.get(mk) || 0) + "px");
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

    syncToplineOffset();
    markers.forEach(function (mk) {
      var label = mk.querySelector(".mk__label");
      if (!label) {
        return;
      }
    });
    steps.forEach(function (step) {
      var axisYear = step.querySelector(".vtimeline-step__axisYear");
      if (!axisYear) {
        return;
      }
    });
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
      var toplineContainer = page.querySelector(".timelineSticky .container-large-2") || page.querySelector(".topline .container-large-2");
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

    function setActiveStep(id) {
      steps.forEach(function (step) {
        var info = step.querySelector("[data-info]");
        var isActive = step.getAttribute("data-id") === id;
        step.classList.toggle("is-active", isActive);

        if (info) {
          if (isActive) {
            info.removeAttribute("hidden");
          } else {
            info.setAttribute("hidden", "");
          }
        }
      });
    }

    function getViewportFocusY() {
      var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--topline-offset"), 10) || 80;
      var toplineH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--topline-height"), 10) || 120;
      var visibleTop = navH + toplineH;
      var visibleHeight = Math.max(120, window.innerHeight - visibleTop);
      return visibleTop + (visibleHeight / 2);
    }

    function findClosestStepToViewportCenter() {
      var focusY = getViewportFocusY();
      var bestStep = null;
      var bestDistance = Infinity;

      steps.forEach(function (step) {
        var icon = step.querySelector(".vtimeline-step__icon");
        var rect = icon ? icon.getBoundingClientRect() : step.getBoundingClientRect();
        var centerY = rect.top + (rect.height / 2);
        var distance = Math.abs(centerY - focusY);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestStep = step;
        }
      });

      return bestStep;
    }

    var syncActiveRaf = null;
    function scheduleActiveSyncFromViewport() {
      if (syncActiveRaf !== null) {
        return;
      }
      syncActiveRaf = window.requestAnimationFrame(function () {
        syncActiveRaf = null;
        var closest = findClosestStepToViewportCenter();
        if (!closest) {
          return;
        }
        var id = closest.getAttribute("data-id");
        if (!id) {
          return;
        }
        setActiveStep(id);
        setActiveMarker(id);
      });
    }

    function closeStepLightbox() {
      if (!lightbox || !lightboxOpen) {
        return;
      }
      lightbox.setAttribute("hidden", "");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");
      lightbox.style.removeProperty("--lb-panel-h");
      lightboxOpen = false;
    }

    function updateLightboxLayoutVars() {
      if (!lightbox || !lightboxOpen) {
        return;
      }
      var panel = lightbox.querySelector(".vremeplov-lightbox__panel");
      if (!panel) {
        return;
      }
      var panelHeight = Math.ceil(panel.getBoundingClientRect().height || panel.offsetHeight || 0);
      lightbox.style.setProperty("--lb-panel-h", Math.max(80, panelHeight) + "px");
    }

    function openStepLightbox(step, triggerBtn) {
      if (!lightbox || !lightboxImage || !lightboxTitle || !lightboxDetail) {
        return;
      }
      var img = step.querySelector(".vtimeline-step__image");
      var title = step.querySelector(".infoBox__title");
      var detail = step.querySelector(".infoBox p");
      var era = step.querySelector(".infoBox__meta");
      var dataImage = triggerBtn ? triggerBtn.getAttribute("data-lb-image") : "";
      var dataTitle = triggerBtn ? triggerBtn.getAttribute("data-lb-title") : "";
      var dataDetail = triggerBtn ? triggerBtn.getAttribute("data-lb-detail") : "";
      var dataEra = triggerBtn ? triggerBtn.getAttribute("data-lb-era") : "";

      if (!img && !dataImage) {
        return;
      }

      lightboxImage.setAttribute("src", dataImage || img.getAttribute("src") || "");
      lightboxImage.setAttribute("alt", dataTitle || (img ? img.getAttribute("alt") || "" : ""));
      lightboxTitle.textContent = dataTitle || (title ? title.textContent || "" : "");
      lightboxDetail.textContent = dataDetail || (detail ? detail.textContent || "" : "");
      if (lightboxEra) {
        lightboxEra.textContent = dataEra || (era ? era.textContent || "" : "");
      }

      lightbox.removeAttribute("hidden");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
      lightboxOpen = true;
      window.requestAnimationFrame(updateLightboxLayoutVars);
    }

    function scrollToStep(id, behavior) {
      var step = document.getElementById(id);
      if (!step) {
        return;
      }
      syncToplineOffset();
      var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--topline-offset"), 10) || 80;
      var toplineH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--topline-height"), 10) || 120;
      var visibleTop = navH + toplineH;
      var visibleHeight = Math.max(120, window.innerHeight - visibleTop);
      var desiredCenterY = visibleTop + (visibleHeight / 2);
      var icon = step.querySelector(".vtimeline-step__icon");
      var targetTop;

      if (icon) {
        var iconRect = icon.getBoundingClientRect();
        var iconCenterDoc = window.scrollY + iconRect.top + (iconRect.height / 2);
        targetTop = iconCenterDoc - desiredCenterY;
      } else {
        targetTop = window.scrollY + step.getBoundingClientRect().top - visibleTop - 6;
      }

      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: behavior || "smooth"
      });
    }

    markers.forEach(function (mk) {
      mk.addEventListener("click", function () {
        var id = mk.getAttribute("data-target");
        if (!id) {
          return;
        }

        history.replaceState(null, "", "#" + id);
        scrollToStep(id);
        setActiveStep(id);
        setActiveMarker(id);
        scheduleToplineConnectorsLayout();
      });
    });

    steps.forEach(function (step) {
      var iconBtn = step.querySelector(".vtimeline-step__icon");
      if (!iconBtn) {
        return;
      }
      iconBtn.addEventListener("click", function (event) {
        event.preventDefault();
        openStepLightbox(step, iconBtn);
      });
    });

    if (lightbox) {
      lightbox.addEventListener("click", function () {
        closeStepLightbox();
      });
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          closeStepLightbox();
        }
      });
      window.addEventListener("resize", function () {
        updateLightboxLayoutVars();
      }, { passive: true });
    }

    var observer = new IntersectionObserver(function (entries) {
      var visible = entries
        .filter(function (entry) { return entry.isIntersecting; })
        .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; })[0];

      if (!visible) {
        return;
      }

      var id = visible.target.getAttribute("data-id");
      if (id) {
        setActiveStep(id);
        setActiveMarker(id);
        history.replaceState(null, "", "#" + id);
      }
    }, {
      root: null,
      threshold: [0.35, 0.6, 0.8],
      rootMargin: "-10% 0px -10% 0px"
    });

    steps.forEach(function (step) {
      observer.observe(step);
    });

    var wheelLocked = false;
    function getActiveIndex() {
      var idx = steps.findIndex(function (step) {
        return step.classList.contains("is-active");
      });
      if (idx !== -1) {
        return idx;
      }
      var bestIdx = 0;
      var bestDist = Infinity;
      var anchor = (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--topline-offset"), 10) || 80) +
        (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--topline-height"), 10) || 120) + 24;
      steps.forEach(function (step, index) {
        var dist = Math.abs(step.getBoundingClientRect().top - anchor);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = index;
        }
      });
      return bestIdx;
    }

    window.addEventListener("wheel", function (event) {
      if (wheelLocked) {
        event.preventDefault();
        return;
      }
      if (Math.abs(event.deltaY) < 8) {
        return;
      }

      var timelineRect = page.querySelector(".vtimeline").getBoundingClientRect();
      var inTimeline = timelineRect.top < window.innerHeight * 0.85 && timelineRect.bottom > window.innerHeight * 0.2;
      if (!inTimeline) {
        return;
      }

      var currentIndex = getActiveIndex();
      var nextIndex = event.deltaY > 0 ? currentIndex + 1 : currentIndex - 1;
      nextIndex = Math.max(0, Math.min(steps.length - 1, nextIndex));

      if (nextIndex === currentIndex) {
        return;
      }

      event.preventDefault();
      var nextId = steps[nextIndex].getAttribute("data-id");
      if (!nextId) {
        return;
      }

      wheelLocked = true;
      scrollToStep(nextId);
      setActiveStep(nextId);
      setActiveMarker(nextId);
      history.replaceState(null, "", "#" + nextId);

      setTimeout(function () {
        wheelLocked = false;
      }, 520);
    }, { passive: false });

    var touchStartY = null;
    var touchStartX = null;
    window.addEventListener("touchstart", function (event) {
      if (!event.touches || event.touches.length !== 1) {
        return;
      }
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    }, { passive: true });

    window.addEventListener("touchend", function (event) {
      if (wheelLocked || touchStartY === null || touchStartX === null || !event.changedTouches || event.changedTouches.length !== 1) {
        touchStartX = null;
        touchStartY = null;
        return;
      }

      var touch = event.changedTouches[0];
      var deltaY = touch.clientY - touchStartY;
      var deltaX = touch.clientX - touchStartX;
      touchStartX = null;
      touchStartY = null;

      if (Math.abs(deltaY) < 45 || Math.abs(deltaY) <= Math.abs(deltaX) * 1.2) {
        return;
      }
      if (touch.target && touch.target.closest(".topline__scroller")) {
        return;
      }

      var timelineRect = page.querySelector(".vtimeline").getBoundingClientRect();
      var inTimeline = timelineRect.top < window.innerHeight * 0.85 && timelineRect.bottom > window.innerHeight * 0.2;
      if (!inTimeline) {
        return;
      }

      var currentIndex = getActiveIndex();
      var nextIndex = deltaY < 0 ? currentIndex + 1 : currentIndex - 1;
      nextIndex = Math.max(0, Math.min(steps.length - 1, nextIndex));
      if (nextIndex === currentIndex) {
        return;
      }

      var nextId = steps[nextIndex].getAttribute("data-id");
      if (!nextId) {
        return;
      }

      wheelLocked = true;
      scrollToStep(nextId);
      setActiveStep(nextId);
      setActiveMarker(nextId);
      history.replaceState(null, "", "#" + nextId);
      setTimeout(function () {
        wheelLocked = false;
      }, 520);
    }, { passive: true });

    (function initFromHash() {
      var id = (window.location.hash || "").replace("#", "");
      if (id) {
        scrollToStep(id, "auto");
        setActiveStep(id);
        setActiveMarker(id);
      } else if (markers[0]) {
        var firstId = markers[0].getAttribute("data-target");
        window.scrollTo({ top: 0, behavior: "auto" });
        setActiveStep(firstId);
        setActiveMarker(firstId);
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
  });
})();



