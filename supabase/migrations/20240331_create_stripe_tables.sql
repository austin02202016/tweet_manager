-- Create stripe_customers table
CREATE TABLE IF NOT EXISTS stripe_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create stripe_invoices table
CREATE TABLE IF NOT EXISTS stripe_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES stripe_customers(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT NOT NULL UNIQUE,
  number TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'paid', 'void', 'uncollectible')),
  created TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  pdf_url TEXT NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create stripe_payment_methods table
CREATE TABLE IF NOT EXISTS stripe_payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES stripe_customers(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  last4 TEXT NOT NULL,
  exp_month INTEGER NOT NULL,
  exp_year INTEGER NOT NULL,
  brand TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for each table
CREATE TRIGGER update_stripe_customers_updated_at
  BEFORE UPDATE ON stripe_customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_invoices_updated_at
  BEFORE UPDATE ON stripe_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_payment_methods_updated_at
  BEFORE UPDATE ON stripe_payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_payment_methods ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own stripe customers"
  ON stripe_customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own invoices"
  ON stripe_invoices FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM stripe_customers
    WHERE stripe_customers.id = stripe_invoices.customer_id
    AND stripe_customers.user_id = auth.uid()
  ));

CREATE POLICY "Users can view their own payment methods"
  ON stripe_payment_methods FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM stripe_customers
    WHERE stripe_customers.id = stripe_payment_methods.customer_id
    AND stripe_customers.user_id = auth.uid()
  )); 