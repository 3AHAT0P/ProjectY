export default (fn, time) => {
  let timer = null;
  let _args = [];

  return (...args) => {
    _args = args;
    if (timer == null) {
      timer = setTimeout(() => {
        timer = null;
        fn.apply(null, _args);
      }, time);
    }
  };
};