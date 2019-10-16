# Enso Carousel

A renderless Vue component carousel.

## Installation

Use npm

```bash
npm install --save enso-carousel
```

or yarn

```bash
yarn add enso-carousel
```

## Usage

MyCarousel.vue

```vue
<template>
  <enso-carousel
    @change="onChange"
    @ready="onReady"
    :slides="[
      {
        content: 'This is my carousel. Here is the first slide.',
      },
      {
        content: 'This is the second slide.',
      },
      {
        content: 'And here is the third slide.',
      },
    ]"
  >
    <div slot-scope="{ prev, next, goto, isCurrentIndex, slides }">
      <div class="enso-carousel__slides">
        <slide
          class="enso-carousel__slide"
          v-for="(slide, index) in slides"
          :key="'slide' + index"
          v-bind="slide"
        ></slide>  
      </div>

      <button @click="prev">
        Previous
      </button>
      <button @click="next">    
        Next
      </button>

      <ul>
        <li v-for="(slide, index) in slides" :key="index">
          <button @click="goto(index)" :class="{ 'is-active': isCurrentIndex(index) }">
            {{ index }}
          </button>
        </li>
      </ul>
    </div>
  </enso-carousel>
</template>

<script>
export default {
  methods: {
    onReady(slide) {
      console.log('The carousel is ready. This slide is showing.', slide);
    },
    onChange(slide) {
      console.log('A different slide was selected.', slide);
    },
  },
};
</script>
```

MySlide.vue

```vue
<template>
  <div>
    {{ content }}
  </div>
</template>

<script>
export default {
  props: {
    content: String,
  },
};
</script>
```

## Props

- slides - Array of slides
- threshold - Number of pixels to drag before counting it as dragging to a new slide. Default 100.

## Events

- ready(slide)
- change(slide)
- drag-start
- drag-move
- drag-end

## Methods

- prev()
- next()
- goto(index)
- isCurrentIndex(index)

## Limitations

CSS limits the slides to being 100vw.
