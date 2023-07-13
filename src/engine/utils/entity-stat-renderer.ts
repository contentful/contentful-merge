import { OutputFormatter } from './output-formatter'

type Pluralizer = (value: number) => string

type RenderEntityProps = {
  icon: string
  pluralizer: Pluralizer
}

export const entityStatRenderer = (props: RenderEntityProps) => {
  return function (value: number, changeType?: string): string {
    if (!props.pluralizer) {
      throw Error('No pluralizer specified')
    }
    return `${props.icon} ${OutputFormatter.formatNumber(value)}${
      changeType ? ` ${changeType} ` : ' '
    }${props.pluralizer(value)}`
  }
}
