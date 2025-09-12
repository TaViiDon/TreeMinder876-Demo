"use client"

import { createMap } from "@/actions/map"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createMapSchema } from "@/lib/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import z from "zod"

export default function CreateMapDialog({ children }: { children: React.ReactElement }) {
  const form = useForm<z.infer<typeof createMapSchema>>({
    resolver: zodResolver(createMapSchema),
    defaultValues: {
      name: ""
    }
  })

  const [error, setError] = useState("")
  const { isDirty, isSubmitting, isValid } = form.formState
  const cannotSubmit = isSubmitting || !isDirty || !isValid

  const onSubmit = (data: z.infer<typeof createMapSchema>) => {
    setError("")

    createMap(data).then(() => {
      console.log("created")
    }).catch((error: Error) => {
      setError(error.message)
    })
  }

  // useEffect(() => {
  //   const { isDirty, isValid } = form.formState
  //   if (isDirty && isValid) {
  //     setError("")
  //   }
  // }, [form.formState])

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Map</DialogTitle>
          <DialogDescription>Create a new, private map for your tree coverage</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Map Name"
                      {...field}
                      onChange={(event) => {
                        setError("");
                        field.onChange(event)
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    This is the name of your new map
                  </FormDescription>
                  <FormMessage>
                    {form.formState.errors.name?.message}
                    {error}
                  </FormMessage>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={cannotSubmit}>Create</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}