export interface Database {
  public: {
    Tables: {
      contracts: {
        Row: {
          id: string
          user_id: string
          filename: string
          file_path: string
          file_size: number
          file_type: string
          extracted_text: string | null
          uploaded_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          file_path: string
          file_size: number
          file_type: string
          extracted_text?: string | null
          uploaded_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          file_path?: string
          file_size?: number
          file_type?: string
          extracted_text?: string | null
          uploaded_at?: string
          updated_at?: string
        }
      }
      analysis_results: {
        Row: {
          id: string
          contract_id: string
          summary: string
          issues: string[]
          improvements: string[]
          analyzed_at: string
        }
        Insert: {
          id?: string
          contract_id: string
          summary: string
          issues: string[]
          improvements: string[]
          analyzed_at?: string
        }
        Update: {
          id?: string
          contract_id?: string
          summary?: string
          issues?: string[]
          improvements?: string[]
          analyzed_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
