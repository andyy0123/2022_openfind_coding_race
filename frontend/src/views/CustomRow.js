import React from "react";
import { Button, Nav } from "react-bootstrap";

const CustomRow = (props) => {
  const {
    domainId,
    domainName,
    domainLink,
    domainImage,
    domainVersion,
    domainStatus,
    deleteDomain,
    connectDomain
  } = props;

  return <tr key={domainId}>
    <td>
      <a href={domainLink} target="_blank" className="nav-link">{domainName}</a>
    </td>
    <td>{domainImage}</td>
    <td>{domainVersion}</td>
    <td>{domainStatus}</td>
    <td>
      <Button
        className="btn-fill pull-right"
        type="submit"
        variant="primary"
        size="xs"
        onClick={connectDomain}
      >
        Connect
      </Button>
    </td>
    <td>
      <Button
        className="btn-fill pull-right"
        type="submit"
        variant="danger"
        size="xs"
        onClick={deleteDomain}
      >
        Delete
      </Button>
    </td>
  </tr>
};

export default CustomRow;