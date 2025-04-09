
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CreditCard, DollarSign, Home } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Link } from "react-router-dom";

// Creating dummy payment data - using string dates to avoid date parsing issues
const payments = [
  {
    id: "pay_1",
    clientName: "TechNova Solutions",
    amount: "$2,500.00",
    status: "succeeded",
    date: "2023-11-15", // Using string date format
    method: "Visa ending in 4242"
  },
  {
    id: "pay_2",
    clientName: "Horizon Marketing",
    amount: "$1,800.00",
    status: "succeeded",
    date: "2023-11-10", // Using string date format
    method: "Mastercard ending in 5555"
  },
  {
    id: "pay_3",
    clientName: "Global Ventures Inc.",
    amount: "$3,200.00",
    status: "processing",
    date: "2023-11-08", // Using string date format
    method: "Amex ending in 0005"
  },
  {
    id: "pay_4",
    clientName: "Blue Ocean Analytics",
    amount: "$950.00",
    status: "failed",
    date: "2023-11-05", // Using string date format
    method: "Visa ending in 1234"
  },
  {
    id: "pay_5",
    clientName: "Stellar Design Studio",
    amount: "$1,750.00",
    status: "succeeded",
    date: "2023-11-01", // Using string date format
    method: "Discover ending in 9876"
  }
];

export default function Payments() {
  return (
    <Layout>
      <ErrorBoundary>
        <div className="container py-6 max-w-6xl">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Payment History</h1>
              <p className="text-muted-foreground">View and manage client payments and transactions.</p>
            </div>
            <Button asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-base px-6 py-2">
              <Link to="/">
                <Home className="h-5 w-5" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-primary" />
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
                      <TableCell className="font-medium">{payment.clientName}</TableCell>
                      <TableCell>{payment.amount}</TableCell>
                      <TableCell>
                        <Badge className={
                          payment.status === "succeeded" ? "bg-primary/10 text-primary border-primary/20" :
                          payment.status === "processing" ? "bg-secondary/80 text-secondary-foreground border-secondary/30" :
                          "bg-destructive/10 text-destructive border-destructive/20"
                        }>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(payment.date), "MMM d, yyyy")}</TableCell>
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
      </ErrorBoundary>
    </Layout>
  );
}
