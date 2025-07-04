import React from "react";

const Preloader = () => {
  return (
    <>
      <div className="absCenter ">
        <div className="loaderPill">
          <div className="loaderPill-anim">
            <div className="loaderPill-anim-bounce">
              <div className="loaderPill-anim-flop">
                <div className="loaderPill-pill"></div>
              </div>
            </div>
          </div>
          <div className="loaderPill-floor">
            <div className="loaderPill-floor-shadow"></div>
          </div>

          <style>
            {`
            
:root {
  --EASE_INOUT_QUAD: cubic-bezier(0.455, 0.03, 0.515, 0.955);
  --EASE_IN_QUAD: cubic-bezier(0.55, 0.085, 0.68, 0.53);
  --EASE_OUT_QUAD: cubic-bezier(0.25, 0.46, 0.45, 0.94);

  --COLOR_UI_PHARMACY: #237db5;
  --loaderPill_DURATION: 1800ms;
}

.absCenter {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.loaderPill {
  text-align: center;
}

.loaderPill-anim {
  height: 160px;
}

.loaderPill-anim-bounce {
  animation: loaderPillBounce var(--loaderPill_DURATION) linear infinite;
}

.loaderPill-anim-flop {
  transform-origin: 50% 50%;
  animation: loaderPillFlop var(--loaderPill_DURATION) linear infinite;
}

.loaderPill-pill {
  display: inline-block;
  box-sizing: border-box;
  width: 80px;
  height: 30px;
  border-radius: 15px;
  border: 1px solid var(--COLOR_UI_PHARMACY);
  background-image: linear-gradient(
    to right,
    var(--COLOR_UI_PHARMACY) 50%,
    #ffffff 50%
  );
}

.loaderPill-floor {
  display: block;
  text-align: center;
}

.loaderPill-floor-shadow {
  display: inline-block;
  width: 70px;
  height: 7px;
  border-radius: 50%;
  background-color: color(var(--COLOR_UI_PHARMACY) alpha(26%));
  transform: translateY(-15px);
  animation: loaderPillScale var(--loaderPill_DURATION) linear infinite;
}

.loaderPill-text {
  font-weight: bold;
  color: var(--COLOR_UI_PHARMACY);
  text-transform: uppercase;
}

@keyframes loaderPillBounce {
  0% {
    transform: translateY(123px);
    animation-timing-function: var(--EASE_OUT_QUAD);
  }
  25% {
    transform: translateY(40px);
    animation-timing-function: var(--EASE_IN_QUAD);
  }
  50% {
    transform: translateY(120px);
    animation-timing-function: var(--EASE_OUT_QUAD);
  }
  75% {
    transform: translateY(20px);
    animation-timing-function: var(--EASE_IN_QUAD);
  }
  100% {
    transform: translateY(120px);
  }
}

@keyframes loaderPillFlop {
  0% {
    transform: rotate(0);
  }
  25% {
    transform: rotate(90deg);
  }
  50% {
    transform: rotate(180deg);
  }
  75% {
    transform: rotate(450deg);
  }
  100% {
    transform: rotate(720deg);
  }
}

@keyframes loaderPillScale {
  0% {
    transform: translateY(-15px) scale(1, 1);
    animation-timing-function: var(--EASE_OUT_QUAD);
  }
  25% {
    transform: translateY(-15px) scale(0.7, 1);
    animation-timing-function: var(--EASE_IN_QUAD);
  }
  50% {
    transform: translateY(-15px) scale(1, 1);
    animation-timing-function: var(--EASE_OUT_QUAD);
  }
  75% {
    transform: translateY(-15px) scale(0.6, 1);
    animation-timing-function: var(--EASE_IN_QUAD);
  }
  100% {
    transform: translateY(-15px) scale(1, 1);
  }
}
`}
          </style>
        </div>
      </div>
    </>
  );
};

export default Preloader;
