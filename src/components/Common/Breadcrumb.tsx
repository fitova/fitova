import React from "react";
import PageCoverHeader from "./PageCoverHeader";

const Breadcrumb = ({ title, pages }: { title: string; pages: string[] }) => {
  return (
    <PageCoverHeader
      title={title}
      breadcrumbPages={pages}
    />
  );
};

export default Breadcrumb;
