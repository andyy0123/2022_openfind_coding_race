import React, { useEffect, useState } from "react";

// react-bootstrap components
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Table,
} from "react-bootstrap";
import CustomRow from './CustomRow';
import _ from 'lodash';

function TableList() {
  let timer;
  const [domainList, setDomainList] = useState([]);
  const [newDomain, setNewDomain] = useState("");
  const [imageVersion, setImageVersion] = useState("6.3.04.013");

  const getDomainListJob = () => {
    if (true) {
      getDomainList();
      timer = !timer && setInterval(() => {
        getDomainList();
      }, 3000);
    }
  };

  const getDomainList = () => {
    fetch("http://k8s:3001/getDomainList").then(response => {
      return response.json();
    }).then((result) => {
      const data = result.data.items.map(item => {
        return {
          domainId: item.metadata?.uid,
          domainName: item.metadata?.labels?.domain,
          domainLink: `http://${item.metadata?.labels?.domain}`,
          domainImage: item.metadata?.image,
          domainVersion: item.metadata?.version,
          domainStatus: item.metadata.deletionTimestamp ? 'TERMINATING' : item.status?.phase,
          deleteDomain: () => {
            console.log(`[Delete] ${item.metadata?.labels?.domain}`);
            deleteDomain(item.metadata?.labels?.domain);
          },
          connectDomain: () => {
            fetch("http://k8s:3001/getDomainConnection", {
              method: "POST",
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ domainName: item.metadata?.labels?.domain })
            }).then(response => {
              return response.json();
            }).then(result => {
              const hostname = result.serviceName;
              const username = 'root';
              const password = 'b3BlbmZpbmQ%3D';
              const url = `http://k8s:31001/?hostname=${hostname}&username=${username}&password=${password}`;
              window.open(url, '_blank').focus();
            });
          }
        }
      });
      setDomainList(data);
    }).catch((error) => {
      console.error(error);
    });
  };

  const deleteDomain = (domainName) => {
    fetch("http://k8s:3001/deleteDomain", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ domainName: domainName })
    }).then(response => {
      getDomainList();
      return response.json();
    }).catch(error => {
      console.log(`[Delete Domain] ${error}`);
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    addDomain(newDomain, imageVersion);
    event.target[0].value = '';
    setNewDomain('');
  };

  const addDomain = (domainName, imageVersion) => {
    fetch("http://k8s:3001/addDomain", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ domainName, imageVersion })
    }).then(response => {
      getDomainList();
      return response.json();
    }).catch(error => {
      console.log(`[Delete Domain] ${error}`);
    });
  };

  useEffect(() => {
    getDomainListJob();
  }, []);

  return (
    <>
      <Container fluid>
        <Row>
          <Col md="12">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Domain</Card.Title>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md="8">
                      <Form.Group>
                        <label>New Domain</label>
                        <Form.Control
                          defaultValue=""
                          placeholder="Add Domain"
                          type="text"
                          required
                          onChange={(e) => {
                            if (!e.target.value.length) {
                              return;
                            }
                            setNewDomain(e.target.value);
                          }}
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                    <Col md="4">
                      <Form.Group>
                        <label>Image Version</label>
                        <Form.Select aria-label="Version" value={imageVersion} className="form-control" onChange={(e) => {
                          setImageVersion(e.target.value);
                        }}>
                          <option>Open this select menu</option>
                          <option value="6.3.04.013">6.3.04.013</option>
                          <option value="6.3.04.014">6.3.04.014</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button
                    className="btn-fill pull-right"
                    type="submit"
                    variant="info"
                    size="sm"
                  >
                    Add
                  </Button>
                  {/* <div className="clearfix"></div> */}
                </Form>
              </Card.Body>
            </Card>
            <Card className="strpied-tabled-with-hover">
              <Card.Header>
                <Card.Title as="h4">Domain List</Card.Title>
              </Card.Header>
              <Card.Body className="table-full-width table-responsive px-0">
                <Table className="table-hover table-striped">
                  <thead>
                    <tr>
                      <th className="border-0">Domain Name</th>
                      <th className="border-0">Image</th>
                      <th className="border-0">Version</th>
                      <th className="border-0">Status</th>
                      <th className="border-0">SSH</th>
                      <th className="border-0">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domainList.map(domain => CustomRow(domain))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default TableList;
