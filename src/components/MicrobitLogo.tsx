const MicrobitLogo = ({
  alt,
  fill = "#fff"
}: {
  alt: string;
  fill?: string;
}) => (
  <svg
    role="img"
    aria-label={alt}
    xmlns="http://www.w3.org/2000/svg"
    height="40"
    width="166.8"
    viewBox="0 0 166.8 40"
    style={{
      width: "auto",
      height: 40
    }}
  >
    <title>{alt}</title>
    <g fill="none" fillRule="evenodd">
      <g fill={fill} fillRule="nonzero">
        <path d="M71.5 29.1h-3.3V20c0-2-1.2-3.5-2.8-3.5-1.6 0-2.8 1.4-2.8 3.5v9.1h-3.2V20c0-2.3-1.4-3.5-2.8-3.5-1.6 0-2.8 1.4-2.8 3.5v9.1h-3.3v-9c0-4.1 2.5-6.9 6.1-6.9 1.7 0 3.1.7 4.4 2.1 1.2-1.4 2.7-2.1 4.5-2.1 3.6 0 6 2.9 6 6.9v9zM77.5 29.1h-3.3V13.6h3.3v15.5zm-1.6-17.8c-1.2 0-2.1-.9-2.1-2.1 0-1.2.9-2.1 2.1-2.1 1.2 0 2.1.9 2.1 2.1 0 1.2-1 2.1-2.1 2.1zM88 29.5c-2.1 0-4.2-.9-5.7-2.4S80 23.6 80 21.3c0-2.2.8-4.3 2.3-5.8 1.5-1.5 3.6-2.4 5.7-2.4 2.3 0 4.3.8 5.8 2.3l.4.4-2.4 2.4-.4-.4c-1.1-1-2.2-1.5-3.4-1.5-2.6 0-4.8 2.2-4.8 4.9s2.1 4.9 4.8 4.9c1.2 0 2.3-.5 3.4-1.4l.4-.4 2.4 2.3-.5.4c-1.7 1.7-3.6 2.5-5.7 2.5zM100 29.1h-3.5v-7.8c0-5 2.2-7.4 7-7.8l.7-.1v3.3l-.5.1c-2.6.3-3.6 1.5-3.6 4.3v8h-.1zM113.2 29.5c-2.1 0-4.2-.9-5.7-2.4s-2.3-3.6-2.3-5.8c0-2.2.8-4.2 2.3-5.8 1.5-1.6 3.5-2.4 5.7-2.4 2.1 0 4.1.9 5.6 2.4s2.3 3.6 2.3 5.8c0 2.2-.8 4.3-2.3 5.8-1.5 1.6-3.5 2.4-5.6 2.4zm0-13c-2.5 0-4.6 2.2-4.6 4.9s2.1 4.9 4.6 4.9c2.6 0 4.6-2.1 4.6-4.9 0-2.8-2.1-4.9-4.6-4.9zM126.6 29.1c-1.2 0-2.3-1-2.3-2.3 0-1.3 1-2.3 2.3-2.3 1.3 0 2.3 1 2.3 2.3 0 1.3-1 2.3-2.3 2.3zM126.6 17.7c-1.2 0-2.3-1-2.3-2.3 0-1.3 1-2.3 2.3-2.3 1.3 0 2.3 1 2.3 2.3 0 1.3-1 2.3-2.3 2.3zM140 29.5c-4.7 0-8-3.7-8-8.9V6.2h3.3v8.5c1.4-1 3-1.5 4.7-1.5 2.1 0 4.1.8 5.6 2.4 1.5 1.5 2.3 3.6 2.3 5.8 0 2.2-.8 4.3-2.3 5.8-1.5 1.5-3.5 2.3-5.6 2.3zm0-13c-2.6 0-4.8 2.2-4.8 4.9s2.1 4.9 4.8 4.9c2.6 0 4.8-2.2 4.8-4.9s-2.2-4.9-4.8-4.9zM154.1 29.1h-3.3V13.6h3.3v15.5zm-1.6-17.8c-1.2 0-2.1-.9-2.1-2.1 0-1.2.9-2.1 2.1-2.1 1.2 0 2.1.9 2.1 2.1 0 1.2-1 2.1-2.1 2.1zM166.5 29.6l-.7-.1c-4.9-.9-6.7-3.3-6.7-8.6V17h-1.4v-3.2h1.4v-3.4h3.3v3.4h4.1V17h-4.1v4.4c0 2.9 1.1 4.4 3.5 4.7l.5.1v3.4h.1zM32.4 24c1.5 0 2.6-1.2 2.6-2.6 0-1.4-1.2-2.6-2.6-2.6-1.5 0-2.6 1.2-2.6 2.6 0 1.4 1.1 2.6 2.6 2.6M13.1 18.8c-1.5 0-2.6 1.2-2.6 2.6 0 1.4 1.2 2.6 2.6 2.6 1.4 0 2.6-1.2 2.6-2.6 0-1.4-1.2-2.6-2.6-2.6" />
        <path d="M13.1 13.6c-4.3 0-7.8 3.5-7.8 7.8s3.5 7.8 7.8 7.8h19.5c4.3 0 7.8-3.5 7.8-7.8s-3.5-7.8-7.8-7.8H13.1zm19.5 20.8H13.1c-7.2 0-13-5.8-13-13s5.8-13 13-13h19.5c7.2 0 13 5.8 13 13s-5.8 13-13 13z" />
      </g>
    </g>
  </svg>
);
export default MicrobitLogo;
