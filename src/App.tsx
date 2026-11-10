import { InvitationLetter } from '@/components/InvitationLetter'
import { MasqueradeMask } from '@/components/MasqueradeMask'
import { Navbar } from '@/components/Navbar'
import { SpiralingComet } from '@/components/SpiralingComet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function App() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 size-[26rem] text-primary/35 spiral-drift md:-right-10 md:size-[32rem]"
      >
        <SpiralingComet className="size-full" />
      </div>

      <header className="relative z-10 border-b border-primary/20 bg-[color-mix(in_oklch,var(--card)_78%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-5">
          <div className="veil-in flex items-start gap-3">
            <MasqueradeMask className="mt-1.5 h-9 w-14 shrink-0 text-primary" />
            <div>
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-primary">
                An invitation to House Verathe
              </p>
              <h1 className="font-heading text-3xl leading-none tracking-tight text-foreground md:text-4xl">
                Masque Character Creator
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                The Masque of Shattered Mirrors
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="veil-in border border-primary/25 bg-secondary/90 tracking-wide text-secondary-foreground"
          >
            Player
          </Badge>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
        <InvitationLetter />

        <div className="veil-in-delay mx-auto flex w-full max-w-2xl flex-wrap gap-2">
          <Button type="button">Accept the invitation</Button>
          <Button type="button" variant="outline" disabled>
            Open build
          </Button>
        </div>
      </main>

      <div className="relative z-10">
        <Navbar />
      </div>
    </div>
  )
}

export default App
