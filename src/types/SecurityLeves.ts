export interface SecurityLevel{
    name: string,
    code: number,
}

export const SecurityLevels : SecurityLevel[] = [
    {
        name: "Publico",
        code: 0,
    },
    {
      name: "Basico",
      code: 1
    },
    {
        name: "Avanzado",
        code: 2
    }
] 
