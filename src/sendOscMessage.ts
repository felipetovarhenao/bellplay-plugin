import { Client } from "node-osc";

export default function sendOscMessage(filePath: string): void {
  const client = new Client("127.0.0.1", 12345); // Replace port if necessary
  client.send({ address: "/load_file", args: [filePath] }, () => {
    client.close();
  });
}
