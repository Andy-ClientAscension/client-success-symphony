
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CreditCard, DollarSign } from "lucide-react";

// Creating dummy payment data
const payments = [
  {
    id: "pay_1",
    clientName: "TechNova Solutions",
    amount: "$2,500.00",
    status: "succeeded",
    date: new Date("2023-11-15"),
    method: "Visa ending in 4242"
  },
  {
    id: "pay_2",
    clientName: "Horizon Marketing",
    amount: "$1,800.00",
    status: "succeeded",
    date: new Date("2023-11-10"),
    method: "Mastercard ending in 5555"
  },
  {
    id: "pay_3",
    clientName: "Global Ventures Inc.",
    amount: "$3,200.00",
    status: "processing",
    date: new Date("2023-11-08"),
    method: "Amex ending in 0005"
  },
  {
    id: "pay_4",
    clientName: "Blue Ocean Analytics",
    amount: "$950.00",
    status: "failed",
    date: new Date("2023-11-05"),
    method: "Visa ending in 1234"
  },
  {
    id: "pay_5",
    clientName: "Stellar Design Studio",
    amount: "$1,750.00",
    status: "succeeded",
    date: new Date("2023-11-01"),
    method: "Discover ending in 9876"
  }
];

export default function Payments() {
  return (
    <Layout>
      <div className="container py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Payment History</h1>
          <p className="text-muted-foreground">View and manage client payments and transactions.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">$10,200.00</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Successful Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground mt-1">80% success rate</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Failed Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground mt-1">20% failure rate</p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.clientName}</TableCell>
                    <TableCell>{payment.amount}</TableCell>
                    <TableCell>
                      <Badge variant={
                        payment.status === "succeeded" ? "success" :
                        payment.status === "processing" ? "outline" :
                        "destructive"
                      }>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(payment.date, "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                        {payment.method}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
