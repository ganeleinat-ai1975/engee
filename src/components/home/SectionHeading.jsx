import React from "react";
import { Link } from "react-router-dom";

export default function SectionHeading({ eyebrow, title, linkText, linkTo, center = false }) {
  return (
    <div className={`flex flex-col gap-3 mb-10 md:mb-14 ${center ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"}`}>
      <div className={center ? "text-center" : ""}>
        {eyebrow && <p className="eyebrow text-subtle mb-3">{eyebrow}</p>}
        <h2 className="custom-font font-editorial text-main text-3xl md:text-5xl leading-tight">{title}</h2>
      </div>
      {linkText && linkTo && (
        <Link to={linkTo} className="eyebrow text-main link-underline self-start md:self-auto">
          {linkText}
        </Link>
      )}
    </div>
  );
}