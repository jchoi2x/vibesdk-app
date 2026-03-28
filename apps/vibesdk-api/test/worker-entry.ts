/**
 * Minimal test worker entry point.
 * Only exports what tests need to avoid loading heavy dependencies.
 */

export default {
  async fetch() {
    return new Response('Test worker');
  },
};
