import React from "react";

const If = ({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) => {
  return show ? <>{children}</> : null;
};

export { If };
