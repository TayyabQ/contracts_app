-- Create contracts table
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    extracted_text TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create analysis_results table
CREATE TABLE IF NOT EXISTS public.analysis_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
    summary TEXT NOT NULL,
    issues JSONB NOT NULL,
    improvements JSONB NOT NULL,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on tables
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contracts
CREATE POLICY "Users can view their own contracts" ON public.contracts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contracts" ON public.contracts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contracts" ON public.contracts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contracts" ON public.contracts
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for analysis_results
CREATE POLICY "Users can view analysis of their contracts" ON public.analysis_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contracts 
            WHERE contracts.id = analysis_results.contract_id 
            AND contracts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert analysis for their contracts" ON public.analysis_results
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.contracts 
            WHERE contracts.id = analysis_results.contract_id 
            AND contracts.user_id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contracts_user_id ON public.contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_uploaded_at ON public.contracts(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_results_contract_id ON public.analysis_results(contract_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for contracts table
CREATE TRIGGER update_contracts_updated_at 
    BEFORE UPDATE ON public.contracts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
