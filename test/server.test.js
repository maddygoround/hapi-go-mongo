"use strict";

const Lab = require("@hapi/lab");
const { expect } = require("@hapi/code");
const { afterEach, beforeEach, describe, it } = (exports.lab = Lab.script());
const { init } = require("../lib/server");

describe("GET /api/tickets", () => {
  let server;

  beforeEach(async () => {
    server = await init();
    console.log("started");
  });

  afterEach(async () => {
    await server.stop();
    console.log("Stopped");
  });

  it("responds with 200", async () => {
    const res = await server.inject({
      method: "get",
      headers: {
        Authorization: "Bearer 47290320668846711828869882046916",
      },
      url: "/api/tickets",
    });
    expect(res.statusCode).to.equal(200);
  });
});

/** use when running against actual database */
// describe("GET /api/tickets/{id}", () => {
//   let server;

//   beforeEach(async () => {
//     server = await init();
//     console.log("started");
//   });

//   afterEach(async () => {
//     await server.stop();
//     console.log("Stopped");
//   });

//   it("responds with 200", async () => {
//     const res = await server.inject({
//       method: "get",
//       headers: {
//         Authorization: "Bearer 47290320668846711828869882046916",
//       },
//       url: "/api/tickets/606ef64fe6351334f1b6b68d",
//     });
//     expect(res.statusCode).to.equal(200);
//     expect(res.request.params.id).not.equal();
//   });
// });

describe("DELETE /api/tickets/{id}", () => {
  let server;

  beforeEach(async () => {
    server = await init();
    console.log("started");
  });

  afterEach(async () => {
    await server.stop();
    console.log("Stopped");
  });

  it("responds with 204", async () => {
    const res = await server.inject({
      method: "delete",
      headers: {
        Authorization: "Bearer 47290320668846711828869882046916",
      },
      url: "/api/tickets/606f020dcd270f3a81c4ca3a",
    });
    expect(res.statusCode).to.equal(204);
    expect(res.request.params.id).not.equal();
  });
});

describe("GET /api/analytics/profit", () => {
  let server;

  beforeEach(async () => {
    server = await init();
    console.log("started");
  });

  afterEach(async () => {
    await server.stop();
    console.log("Stopped");
  });

  it("responds with 200 for method js", async () => {
    const res = await server.inject({
      method: "post",
      payload: {
        start_date: "2021-04-04T00:00:00.000Z",
        end_date: "2022-10-06T00:00:00.000Z",
      },
      headers: {
        Authorization: "Bearer 47290320668846711828869882046916",
      },
      url: "/api/analytics/profit?method=js",
    });
    expect(res.statusCode).to.equal(200);
    expect(res.request.params.type).equal("profit");
    expect(res.request.query.method).equal("js");
  });

  it("responds with 200 for method aggregation", async () => {
    const res = await server.inject({
      method: "post",
      payload: {
        start_date: "2021-04-04T00:00:00.000Z",
        end_date: "2022-10-06T00:00:00.000Z",
      },
      headers: {
        Authorization: "Bearer 47290320668846711828869882046916",
      },
      url: "/api/analytics/profit?method=aggregration",
    });
    expect(res.statusCode).to.equal(200);
    expect(res.request.params.type).equal("profit");
    expect(res.request.query.method).equal("aggregration");
  });
});

describe("GET /api/analytics/visits", () => {
  let server;

  beforeEach(async () => {
    server = await init();
    console.log("started");
  });

  afterEach(async () => {
    await server.stop();
    console.log("Stopped");
  });

  it("responds with 200 for method js", async () => {
    const res = await server.inject({
      method: "post",
      payload: {
        start_date: "2021-04-04T00:00:00.000Z",
        end_date: "2022-10-06T00:00:00.000Z",
      },
      headers: {
        Authorization: "Bearer 47290320668846711828869882046916",
      },
      url: "/api/analytics/visits?method=js",
    });
    expect(res.statusCode).to.equal(200);
    expect(res.request.params.type).equal("visits");
    expect(res.request.query.method).equal("js");
  });

  it("responds with 200 for method aggregation", async () => {
    const res = await server.inject({
      method: "post",
      payload: {
        start_date: "2021-04-04T00:00:00.000Z",
        end_date: "2022-10-06T00:00:00.000Z",
      },
      headers: {
        Authorization: "Bearer 47290320668846711828869882046916",
      },
      url: "/api/analytics/visits?method=aggregration",
    });
    expect(res.statusCode).to.equal(200);
    expect(res.request.params.type).equal("visits");
    expect(res.request.query.method).equal("aggregration");
  });
});
