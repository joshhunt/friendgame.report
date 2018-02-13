import _ from 'lodash';

function elementInViewport(el) {
  const rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function randomArrayElem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function roseEffect(el, _options) {
  // Defaults for the option object, which gets extended below
  const defaults = {
    blowAnimations: [
      'blow-soft-left',
      'blow-medium-left',
      'blow-soft-right',
      'blow-medium-right',
    ],
    className: 'sakura',
    fallSpeed: 1,
    maxSize: 14,
    minSize: 10,
    newOn: 300,
    swayAnimations: [
      'sway-0',
      'sway-1',
      'sway-2',
      'sway-3',
      'sway-4',
      'sway-5',
      'sway-6',
      'sway-7',
      'sway-8',
    ],
  };

  const options = _.merge({}, defaults, _options);

  el.style.overflowX = 'hidden'; // eslint-disable-line

  function petalCreator() {
    if (el.sakuraAnimId) {
      setTimeout(() => {
        requestAnimationFrame(petalCreator);
      }, options.newOn);
    }

    // Get one random animation of each type and randomize fall time of the petals
    const blowAnimation = randomArrayElem(options.blowAnimations);
    const swayAnimation = randomArrayElem(options.swayAnimations);
    const fallTime =
      (document.documentElement.clientHeight * 0.007 +
        Math.round(Math.random() * 5)) *
      options.fallSpeed;

    // Build animation
    const animations =
      `fall ${fallTime}s linear 0s 1` +
      `, ${blowAnimation} ${(fallTime > 30 ? fallTime : 30) -
        20 +
        randomInt(0, 20)}s linear 0s infinite` +
      `, ${swayAnimation} ${randomInt(2, 4)}s linear 0s infinite`;

    // Create petal and randomize size
    const petal = document.createElement('div');
    petal.classList.add(options.className);
    const height = randomInt(options.minSize, options.maxSize);
    const width = height - Math.floor(randomInt(0, options.minSize) / 3);

    petal.addEventListener('animationEnd', () => {
      if (!elementInViewport(petal)) {
        petal.parentNode.removeChild(petal);
      }
    });

    petal.addEventListener('animationiteration', ev => {
      if (
        options.blowAnimations.includes(ev.animationName) ||
        (options.swayAnimations.includes(ev.animationName) &&
          !elementInViewport(petal))
      ) {
        petal.parentNode.removeChild(petal);
      }
    });

    Object.assign(petal.style, {
      animation: animations,
      borderRadius: `${randomInt(
        options.maxSize,
        options.maxSize + Math.floor(Math.random() * 10),
      )}px ${randomInt(1, Math.floor(width / 4))}px`,
      height: `${height}px`,
      width: `${width}px`,
      left: `${Math.random() * document.documentElement.clientWidth - 100}px`,
      marginTop: `${-(Math.floor(Math.random() * 20) + 15)}px`,
    });

    el.appendChild(petal);
  }

  el.sakuraAnimId = requestAnimationFrame(petalCreator);
}
