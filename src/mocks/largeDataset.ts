
import { faker } from '@faker-js/faker';

export interface MockClient {
  id: string;
  clientId: string;
  clientName: string;
  status: "new" | "active" | "caution" | "not-active" | "at-risk" | "churned" | "paused" | "graduated";
  renewalDate: string;
  notes: string;
  painPoints: string[];
  team?: string;
  riskLevel?: "low" | "medium" | "high";
  paymentStatus?: "paid" | "unpaid" | "overdue";
  contractType?: "monthly" | "quarterly" | "annually";
  mrr?: number;
  npsScore?: number;
}

export const generateMockClients = (count: number = 10000): MockClient[] => {
  return Array.from({ length: count }, (_, index) => {
    const status = faker.helpers.arrayElement([
      "new", "active", "caution", "not-active", "at-risk", "churned", "paused", "graduated"
    ]);
    
    // Generate risk level based on status for more realistic data
    let riskLevel: "low" | "medium" | "high";
    if (status === "active" || status === "new") {
      riskLevel = faker.helpers.arrayElement(["low", "medium"]);
    } else if (status === "caution" || status === "at-risk") {
      riskLevel = faker.helpers.arrayElement(["medium", "high"]);
    } else {
      riskLevel = faker.helpers.arrayElement(["high", "medium"]);
    }

    // Generate payment status with some logic
    const paymentStatus = status === "churned" || status === "not-active" 
      ? faker.helpers.arrayElement(["unpaid", "overdue"])
      : faker.helpers.arrayElement(["paid", "unpaid"]);

    return {
      id: faker.string.uuid(),
      clientId: faker.string.uuid(),
      clientName: faker.company.name(),
      status,
      renewalDate: faker.date.future().toISOString(),
      notes: faker.lorem.sentence(),
      painPoints: Array.from(
        { length: faker.number.int({ min: 0, max: 3 }) },
        () => faker.lorem.words(3)
      ),
      team: faker.helpers.arrayElement([
        "Enterprise",
        "SMB", 
        "Startup",
        "Mid-Market",
        undefined
      ]),
      riskLevel,
      paymentStatus,
      contractType: faker.helpers.arrayElement(["monthly", "quarterly", "annually"]),
      mrr: faker.number.int({ min: 100, max: 5000 }),
      npsScore: faker.number.float({ min: 0, max: 10, fractionDigits: 1 })
    };
  });
};

export const mockClients = generateMockClients();
