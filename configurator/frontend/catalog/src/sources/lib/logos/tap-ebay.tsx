import * as React from "react"

function Svg(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="100%" width="100%" viewBox="0 0 200 200" {...props}>
      <defs>
        <style>{".cls-1{fill:#e53238;}.cls-2{fill:#3366b1;}.cls-3{fill:#f3af1c;}.cls-4{fill:#86b940;}"}</style>
      </defs>
      <g id="Guidelines">
        <path
          className="cls-1"
          d="M38.33,86.88c7,0,11.76,4.29,11.76,10.71H26c0-6.82,6.22-10.71,12.36-10.71Zm.3-5.57c-11.67,0-21.4,5-21.4,19.9,0,11.83,6.54,19.29,21.71,19.29,17.85,0,19-11.76,19-11.76H49.28s-1.85,6.33-10.87,6.33c-7.35,0-12.63-5-12.63-11.91H58.83V98.79c0-6.88-4.36-17.48-20.2-17.48Z"
        />
        <path
          className="cls-2"
          d="M80.23,87.13c7.93,0,13,5.88,13,13.77,0,8.47-5.82,14-12.91,14-8.46,0-13-6.6-13-13.92,0-6.82,4.09-13.85,13-13.85ZM58.83,66.84V113c0,2.62-.19,6.29-.19,6.29h8.25s.3-2.64.3-5.05c0,0,4.07,6.37,15.15,6.37,11.67,0,19.6-8.1,19.6-19.71,0-10.8-7.28-19.48-19.58-19.48-11.51,0-15.09,6.22-15.09,6.22V66.84Z"
        />
        <path
          className="cls-3"
          d="M132.09,101.81v2.41c0,3.15-1.94,11-13.37,11-6.26,0-8.94-3.13-8.94-6.75,0-6.59,9-6.63,22.31-6.63Zm-9.65-20.5c-17.56,0-18.69,9.61-18.69,11.15h8.74s.46-5.61,9.35-5.61c5.78,0,10.25,2.64,10.25,7.72v1.81H121.84c-13.61,0-20.8,4-20.8,12.06s6.65,12.28,15.63,12.28c12.24,0,16.18-6.77,16.18-6.77,0,2.69.21,5.34.21,5.34h7.77s-.3-3.28-.3-5.38V95.73c0-11.92-9.61-14.42-18.09-14.42Z"
        />
        <polygon
          className="cls-4"
          points="135.82 82.82 145.66 82.82 159.78 111.1 173.86 82.82 182.77 82.82 157.12 133.16 147.77 133.16 155.17 119.13 135.82 82.82 135.82 82.82"
        />
      </g>
    </svg>
  )
}

export default Svg