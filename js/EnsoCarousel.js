export default {
  props: {
    threshold: {
      type: Number,
      default: 100
    },
    slides: {
      type: Array,
      required: []
    }
  },

  data() {
    return {
      currentIndex: 0
    };
  },

  computed: {
    totalSlideWidth() {
      return (this.slides.length + 2) * 100 + "vw";
    }
  },

  mounted() {
    this.containerEl = this.$el.querySelector(".enso-carousel__slides");
    this.slidesEls = this.$el.querySelectorAll(".enso-carousel__slide");
    this.linkDragging = false;
    this.allowShift = true;
    this.posX1 = 0;
    this.posX2 = 0;
    this.posInitial = null;
    this.posFinal = null;
    this.firstSlide = this.slidesEls[0];
    this.lastSlide = this.slidesEls[this.slides.length - 1];
    this.cloneFirst = this.firstSlide.cloneNode(true);
    this.cloneLast = this.lastSlide.cloneNode(true);
    this.containerEl.appendChild(this.cloneFirst);
    this.containerEl.insertBefore(this.cloneLast, this.firstSlide);
    this.containerEl.onmousedown = this.dragStart;
    this.containerEl.addEventListener("touchstart", this.dragStart);
    this.containerEl.addEventListener("touchend", this.dragEnd);
    this.containerEl.addEventListener("touchmove", this.dragMove);
    this.containerEl.addEventListener("transitionend", this.onTransitionEnd);
    this.containerEl.addEventListener(
      "webkitTransitionEnd",
      this.onTransitionEnd
    );
    this.containerEl.addEventListener("click", this.onClick);
    this.containerEl.style.width = this.totalSlideWidth;

    this.slideWidth = this.slidesEls[0].offsetWidth;
    this.links = this.containerEl.getElementsByTagName("a");

    // Add a click handler to all links. Instead we will handle click events
    // that bubble up to the container and inspect their originalTarget.
    // This way we can have slides with links be draggable.
    Array.from(this.links).forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault();
      });
    });

    Array.from(document.querySelectorAll(".enso-carousel__slide *")).forEach(
      el => {
        el.addEventListener("click", e => {
          e.preventDefault();
        });
      }
    );

    window.addEventListener("resize", this.onResize);

    this.$emit("ready", this.slides[0]);
  },

  methods: {
    isTargetWithinSlide(target) {
      for (let i = 0; i < this.slidesEls.length; i++) {
        const slide = this.slidesEls[i];

        if (slide.contains(target)) {
          return true;
        }
      }

      return false;
    },

    onClick(e) {
      // If a link was clicked and not dragged, navigate to the link's href
      if (!this.linkDragging) {
        if (e.originalTarget.tagName === "A") {
          window.location = e.originalTarget.href;
        }

        // This is also handles, e.g. clicking an image within a link.
        let closest_link = e.originalTarget.closest("a");

        if (closest_link) {
          window.location = e.closest_link.href;
        }
      }
    },

    onResize() {
      this.slideWidth = this.slidesEls[0].offsetWidth;
      this.posInitial = this.containerEl.offsetLeft;
    },

    prev() {
      this.slideTo(-1);
    },

    next() {
      this.slideTo(1);
    },

    dragStart(e) {
      // By deafult links and images can be dragged around into a
      // file browser or into the address bar. Instead of this we
      // want to use our own drag logic so we'll disable this.
      e.preventDefault();

      // If we're dragging a link element then make a note of that so that we
      // can handle click events. We need this value to persist after the
      // dragend event has fired as the mouseup event that causes the click
      // fires after the dragend. We'll only reset this to false if the
      // drag didn't pass the threshold.
      if (this.isTargetWithinSlide(e.originalTarget)) {
        this.linkDragging = true;
      }

      e = e || window.event;
      e.preventDefault;
      this.posInitial = this.containerEl.offsetLeft;

      if (e.type === "touchstart") {
        this.posX1 = e.touches[0].clientX;
      } else {
        this.posX1 = e.clientX;
        document.onmouseup = this.dragEnd;
        document.onmousemove = this.dragMove;
      }

      this.$emit("drag-start");
    },

    dragMove(e) {
      e = e || window.event;

      if (e.type === "touchmove") {
        this.posX2 = this.posX1 - e.touches[0].clientX;
        this.posX1 = e.touches[0].clientX;
      } else {
        this.posX2 = this.posX1 - e.clientX;
        this.posX1 = e.clientX;
      }

      this.containerEl.style.left = `${this.containerEl.offsetLeft -
        this.posX2}px`;

      this.$emit("drag-move");
    },

    dragEnd(e) {
      this.posFinal = this.containerEl.offsetLeft;

      if (this.posFinal - this.posInitial < -this.threshold) {
        // We dragged to the left
        this.slideTo(1, "drag");
      } else if (this.posFinal - this.posInitial > this.threshold) {
        // We dragged to the right
        this.slideTo(-1, "drag");
      } else {
        // We didn't actually drag. Treat this as a click
        this.linkDragging = false;

        // Reset the left value to move the carousel back to initial position
        this.containerEl.style.left = `${this.posInitial}px`;
      }

      document.onmouseup = null;
      document.onmousemove = null;

      this.$emit("drag-end");
    },

    slideTo(direction, action) {
      this.containerEl.classList.add("enso-carousel__slides--sliding");

      if (this.allowShift) {
        this.allowShift = false;

        if (!action) {
          this.posInitial = this.containerEl.offsetLeft;
        }

        if (direction > 0) {
          this.containerEl.style.left =
            this.posInitial - this.slideWidth * direction + "px";
          this.currentIndex = this.currentIndex + direction;
        } else if (direction < 0) {
          this.containerEl.style.left =
            this.posInitial - this.slideWidth * direction + "px";
          this.currentIndex = this.currentIndex + direction;
        }
      }
    },

    goto(index) {
      let direction = index - this.currentIndex;
      this.slideTo(direction);
    },

    onTransitionEnd() {
      this.containerEl.classList.remove("enso-carousel__slides--sliding");

      if (this.currentIndex === -1) {
        this.containerEl.style.left = `${-(
          this.slides.length * this.slideWidth
        )}px`;
        this.currentIndex = this.slides.length - 1;
      }

      if (this.currentIndex === this.slides.length) {
        this.containerEl.style.left = `${-(1 * this.slideWidth)}px`;
        this.currentIndex = 0;
      }

      this.$emit("change", this.slides[this.currentIndex]);

      this.allowShift = true;
    },

    isCurrentIndex(index) {
      if (index === this.currentIndex) {
        return true;
      } else if (index === 0 && this.currentIndex === -1) {
        return true;
      } else if (
        index === this.slides.length - 1 &&
        this.currentIndex === this.slides.length
      ) {
        return true;
      } else {
        return false;
      }
    }
  },

  render() {
    return this.$scopedSlots.default({
      prev: this.prev,
      next: this.next,
      goto: this.goto,
      isCurrentIndex: this.isCurrentIndex,
      slides: this.slides
    });
  }
};
