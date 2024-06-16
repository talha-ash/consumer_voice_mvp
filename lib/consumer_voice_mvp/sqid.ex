 defmodule ConsumerVoiceMvp.Sqids do
     import Sqids.Hacks, only: [dialyzed_ctx: 1]
     @context Sqids.new!()

     def encode!(numbers), do: Sqids.encode!(dialyzed_ctx(@context), numbers)
     def decode!(id), do: Sqids.decode!(dialyzed_ctx(@context), id)
   end
