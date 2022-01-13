declare interface IStaticPortalWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  NodeListIdFieldLabel: string;
  NodeValueListIdFieldLabel: string;
  MibDataServerRelativePath: string;
}

declare module 'StaticPortalWebPartStrings' {
  const strings: IStaticPortalWebPartStrings;
  export = strings;
}
