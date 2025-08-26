import { supabaseAdmin } from '../lib/supabase-admin'

async function setupDatabase() {
  console.log('Setting up database schema...')
  
  try {
    // Create storage bucket for contracts
    const { data: bucketData, error: bucketError } = await supabaseAdmin.storage.createBucket('contracts', {
      public: false,
      allowedMimeTypes: ['application/pdf'],
      fileSizeLimit: 52428800, // 50MB limit
    })
    
    if (bucketError && bucketError.message !== 'Bucket already exists') {
      console.error('Error creating storage bucket:', bucketError)
    } else {
      console.log('Storage bucket created successfully')
    }

    // Set up storage policies
    const storagePolicies = [
      {
        name: 'Users can upload their own contracts',
        policy: `
          CREATE POLICY "Users can upload their own contracts" ON storage.objects
          FOR INSERT WITH CHECK (
            bucket_id = 'contracts' AND 
            auth.uid()::text = (storage.foldername(name))[1]
          )
        `
      },
      {
        name: 'Users can view their own contracts',
        policy: `
          CREATE POLICY "Users can view their own contracts" ON storage.objects
          FOR SELECT USING (
            bucket_id = 'contracts' AND 
            auth.uid()::text = (storage.foldername(name))[1]
          )
        `
      },
      {
        name: 'Users can delete their own contracts',
        policy: `
          CREATE POLICY "Users can delete their own contracts" ON storage.objects
          FOR DELETE USING (
            bucket_id = 'contracts' AND 
            auth.uid()::text = (storage.foldername(name))[1]
          )
        `
      }
    ]

    // Note: These policies need to be run in the Supabase SQL editor
    console.log('Storage policies to be created in Supabase SQL editor:')
    storagePolicies.forEach(policy => {
      console.log(`\n-- ${policy.name}`)
      console.log(policy.policy)
    })

    console.log('\nDatabase setup completed!')
    console.log('Please run the SQL schema from database/schema.sql in your Supabase SQL editor.')
    
  } catch (error) {
    console.error('Error setting up database:', error)
  }
}

setupDatabase()
