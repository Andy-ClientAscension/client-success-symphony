import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Terms of Service
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <h2>Acceptance of Terms</h2>
            <p>
              By accessing and using Client360, you accept and agree to be bound by the terms and 
              provision of this agreement.
            </p>

            <h2>Description of Service</h2>
            <p>
              Client360 is a student success management platform that helps organizations track 
              client relationships, renewals, and performance metrics.
            </p>

            <h2>User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials 
              and for all activities that occur under your account.
            </p>

            <h2>Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the service for any unlawful purpose</li>
              <li>Interfere with or disrupt the service</li>
              <li>Upload or transmit malicious code</li>
              <li>Attempt to gain unauthorized access to the system</li>
            </ul>

            <h2>Data and Privacy</h2>
            <p>
              Your use of the service is also governed by our Privacy Policy. Please review our 
              Privacy Policy for information on how we collect, use, and share your information.
            </p>

            <h2>Service Availability</h2>
            <p>
              While we strive to maintain high availability, we do not guarantee that the service 
              will be available 100% of the time.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              In no event shall Client360 be liable for any indirect, incidental, special, 
              consequential, or punitive damages.
            </p>

            <h2>Termination</h2>
            <p>
              We may terminate or suspend your account at any time for violation of these terms 
              or for any other reason.
            </p>

            <h2>Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the service 
              constitutes acceptance of modified terms.
            </p>

            <h2>Contact Information</h2>
            <p>
              If you have questions about these Terms of Service, please contact us at terms@client360.com
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}