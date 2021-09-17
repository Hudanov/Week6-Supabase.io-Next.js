import { Auth as AuthForm } from '@supabase/ui'
import { supabase } from '../utils/supabaseClient'

export default function Auth() {
  return (
    <div className="px-8 py-12 z-10 auth-form">
      <AuthForm supabaseClient={supabase} providers={['google']} magicLink={true} />
    </div>
  )
}