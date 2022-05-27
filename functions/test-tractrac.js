import fetch from "node-fetch";

fetch(
  "https://em.event.tractrac.com/race_status/get_info.json?eventid=d1131c20-76c1-013a-bc67-60a44ce903c3&raceid=d432b550-b4a9-013a-1a7f-60a44ce903c3&callback=jQuery17006729724068321064_1652608239939&_=1652608241382",
  {
    headers: {
      Referer: "http://3drerun.worldofo.com/",
      "Content-Type": "application/javascript; charset=utf-8",
    },
  }
)
  .then((res) => res.text())
  .then((data) => console.log(data));
