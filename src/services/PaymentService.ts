import * as signalR from "@microsoft/signalr";

class PaymentService {
  private connection: signalR.HubConnection | null = null;
  private isConnected: boolean = false;

  public startConnection(onReceivePayment: (orderId: string, amount: number) => void) {
    if (this.isConnected) return;

    // TODO: Thay thế 7144 bằng port backend thực tế của bạn
    const hubUrl = "https://localhost:7144/paymentHub";

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection.on("ReceivePayment", (orderId: string, amount: number) => {
      console.log("ReceivePayment EVENT FIRED!", orderId, amount);
      onReceivePayment(orderId, amount);
    });

    this.connection
      .start()
      .then(() => {
        this.isConnected = true;
        console.log("⚡ SignalR Payment Hub Connected!");
      })
      .catch((err) => {
        console.error("❌ SignalR Connection Error: ", err);
      });
  }

  public stopConnection() {
    if (this.connection && this.isConnected) {
      this.connection.stop().then(() => {
        this.isConnected = false;
        console.log("🛑 SignalR Payment Hub Disconnected!");
      });
    }
  }
}

export const paymentService = new PaymentService();
