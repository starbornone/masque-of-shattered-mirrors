import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

function App() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-sm text-muted-foreground">
              The Masque of Shattered Mirrors
            </p>
            <h1 className="text-lg font-medium tracking-tight">
              Masque Character Creator
            </h1>
          </div>
          <Badge variant="secondary">Player</Badge>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Scaffold ready</CardTitle>
            <CardDescription>
              Vite + TypeScript + shadcn/ui are wired. Attribute engine, session
              zero, and GM mode come next.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              This shell is player-safe by default. The GM panel stays hidden
              until Phase 0 mode toggle lands.
            </p>
            <Separator />
            <div className="flex flex-wrap gap-2">
              <Button type="button">Start session zero</Button>
              <Button type="button" variant="outline" disabled>
                Open build
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default App
