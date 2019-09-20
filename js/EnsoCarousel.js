export default {
  props: {
    threshold: {
      type: Number,
      default: 100,
    },
    slides: {
      type: Array,
      required: [],
    },
  },

  data() {
    return {
      currentIndex: 0,
    };
  },

  mounted() {
    this.slides_container_el = this.$el.querySelector('.enso-carousel__slides');
    this.slides_els = this.$el.querySelectorAll('.enso-carousel__slide');

    this.allowShift = true;
    this.posX1 = 0;
    this.posX2 = 0;
    this.posInitial = null;
    this.posFinal = null;
    this.slideWidth = this.slides_els[0].offsetWidth;
    this.firstSlide = this.slides_els[0];
    this.lastSlide = this.slides_els[this.slides.length - 1];
    this.cloneFirst = this.firstSlide.cloneNode(true);
    this.cloneLast = this.lastSlide.cloneNode(true);
    this.slides_container_el.appendChild(this.cloneFirst);
    this.slides_container_el.insertBefore(this.cloneLast, this.firstSlide);
    this.slides_container_el.onmousedown = this.dragStart;
    this.slides_container_el.addEventListener('touchstart', this.dragStart);
    this.slides_container_el.addEventListener('touchend', this.dragEnd);
    this.slides_container_el.addEventListener('touchmove', this.dragMove);
    this.slides_container_el.addEventListener('transitionend', this.onTransitionEnd);
    this.slides_container_el.addEventListener('webkitTransitionEnd', this.onTransitionEnd);

    window.addEventListener('resize', this.onResize);

    this.$emit('ready', this.slides[0]);
  },

  methods: {
    onResize() {
      this.slideWidth = this.slides_els[0].offsetWidth;
      this.posInitial = this.slides_container_el.offsetLeft;
    },

    prev() {
      this.slideTo(-1);
    },

    next() {
      this.slideTo(1);
    },

    dragStart(e) {
      e = e || window.event;
      e.preventDefault;
      this.posInitial = this.slides_container_el.offsetLeft;

      if (e.type === 'touchstart') {
        this.posX1 = e.touches[0].clientX;
      } else {
        this.posX1 = e.clientX;
        document.onmouseup = this.dragEnd;
        document.onmousemove = this.dragMove;
      }

      this.$emit('drag-start');
    },

    dragMove(e) {
      e = e || window.event;

      if (e.type === 'touchmove') {
        this.posX2 = this.posX1 - e.touches[0].clientX;
        this.posX1 = e.touches[0].clientX;
      } else {
        this.posX2 = this.posX1 - e.clientX;
        this.posX1 = e.clientX;
      }

      this.slides_container_el.style.left = `${this.slides_container_el.offsetLeft - this.posX2}px`;

      this.$emit('drag-move');
    },

    dragEnd(e) {
      this.posFinal = this.slides_container_el.offsetLeft;

      if (this.posFinal - this.posInitial < -this.threshold) {
        this.slideTo(1, 'drag');
      } else if (this.posFinal - this.posInitial > this.threshold) {
        this.slideTo(-1, 'drag');
      } else {
        this.slides_container_el.style.left = `${this.posInitial}px`;
      }

      document.onmouseup = null;
      document.onmousemove = null;

      this.$emit('drag-end');
    },

    slideTo(direction, action) {
      this.slides_container_el.classList.add('enso-carousel__slides--sliding');

      if (this.allowShift) {
        if (!action) {
          this.posInitial = this.slides_container_el.offsetLeft;
        }

        if (direction > 0) {
          this.slides_container_el.style.left =
            this.posInitial - this.slideWidth * direction + 'px';
          this.currentIndex = this.currentIndex + direction;
        } else if (direction < 0) {
          this.slides_container_el.style.left =
            this.posInitial - this.slideWidth * direction + 'px';
          this.currentIndex = this.currentIndex + direction;
        }
      }

      this.allowShift = false;
    },

    goto(index) {
      let direction = index - this.currentIndex;
      this.slideTo(direction);
    },

    onTransitionEnd() {
      this.slides_container_el.classList.remove('enso-carousel__slides--sliding');

      if (this.currentIndex === -1) {
        this.slides_container_el.style.left = `${-(this.slides.length * this.slideWidth)}px`;
        this.currentIndex = this.slides.length - 1;
      }

      if (this.currentIndex === this.slides.length) {
        this.slides_container_el.style.left = `${-(1 * this.slideWidth)}px`;
        this.currentIndex = 0;
      }

      this.$emit('change', this.slides[this.currentIndex]);

      this.allowShift = true;
    },

    isCurrentIndex(index) {
      if (index === this.currentIndex) {
        return true;
      } else if (index === 0 && this.currentIndex === -1) {
        return true;
      } else if (index === this.slides.length - 1 && this.currentIndex === this.slides.length) {
        return true;
      } else {
        return false;
      }
    },
  },

  render() {
    return this.$scopedSlots.default({
      prev: this.prev,
      next: this.next,
      goto: this.goto,
      isCurrentIndex: this.isCurrentIndex,
      slides: this.slides,
    });
  },
};
