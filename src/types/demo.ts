export type DemoStepData = {
  image: string
  stepTitle: string
  description: string
  hotspot: {
    x: number
    y: number
    width: number
    height: number
  }
  tooltipPosition: 'top' | 'bottom' | 'left' | 'right'
}

export type ProductDemo = {
  id: string
  name: string
  accentColor: string
  steps: DemoStepData[]
}
