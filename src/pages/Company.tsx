import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import Button from "../components/ui/Button";
import Callout from "../components/ui/Callout";
import { Skeleton } from "../components/ui/SkeletonLoader";
import Tabs from "../components/ui/Tabs";
import TextField from "../components/ui/TextField";
import { getApiErrorMessage } from "../utils/apiError.util";
import { useAuth } from "../features/auth/hooks/useAuth";
import {
  CompanyBrandingSchema,
  CompanyDetailsSchema,
  type CompanyBrandingValues,
  type CompanyDetailsValues,
} from "../features/company/company.schema";
import {
  useCompany,
  useUpdateCompany,
} from "../features/company/hooks/useCompany";
import type { Company as CompanyProfile } from "../features/company/company.types";

const DetailsTab = ({
  company,
  canEdit,
}: {
  company: CompanyProfile;
  canEdit: boolean;
}) => {
  const updateCompany = useUpdateCompany();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CompanyDetailsValues>({
    resolver: zodResolver(CompanyDetailsSchema),
    mode: "onTouched",
    defaultValues: {
      companyName: company.companyName,
      companyEmail: company.companyEmail,
      companyPhoneNumber: company.companyPhoneNumber,
      companyAddress: company.companyAddress,
    },
  });

  const onSubmit = async (values: CompanyDetailsValues) => {
    try {
      await updateCompany.mutateAsync(values);
      toast.success("Company details saved");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "We couldn't save your company details."),
      );
    }
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: "Properties", value: company._count.properties },
          { label: "Members", value: company._count.members },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[16px] border border-[#E7E3DA] bg-white p-6"
          >
            <p className="text-[15px] font-medium text-[#4A463E]">
              {stat.label}
            </p>
            <p className="mt-4 text-[38px] leading-none font-semibold tracking-[-0.02em] text-[#141412]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-5 rounded-[16px] border border-[#E7E3DA] bg-white p-5 sm:p-7"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Company name"
            disabled={!canEdit}
            error={errors.companyName?.message}
            {...register("companyName")}
          />
          <TextField
            label="Company email"
            type="email"
            disabled={!canEdit}
            error={errors.companyEmail?.message}
            {...register("companyEmail")}
          />
          <TextField
            label="Phone"
            disabled={!canEdit}
            error={errors.companyPhoneNumber?.message}
            {...register("companyPhoneNumber")}
          />
          <TextField
            label="Address"
            disabled={!canEdit}
            error={errors.companyAddress?.message}
            {...register("companyAddress")}
          />
        </div>

        {canEdit && (
          <div className="mt-6">
            <Button
              type="submit"
              disabled={!isDirty || updateCompany.isPending}
              className="px-8"
            >
              {updateCompany.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        )}
      </form>
    </>
  );
};

const BrandingTab = ({
  company,
  canEdit,
}: {
  company: CompanyProfile;
  canEdit: boolean;
}) => {
  const updateCompany = useUpdateCompany();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<CompanyBrandingValues>({
    resolver: zodResolver(CompanyBrandingSchema),
    mode: "onTouched",
    defaultValues: { companyLogo: company.companyLogo ?? "" },
  });

  const logoUrl = watch("companyLogo");

  const onSubmit = async (values: CompanyBrandingValues) => {
    try {
      // Cleared deliberately sends null, which the API accepts; "" is not a URL.
      await updateCompany.mutateAsync({
        companyLogo: values.companyLogo || null,
      });
      toast.success("Branding saved");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "We couldn't save your branding."));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-[16px] border border-[#E7E3DA] bg-white p-5 sm:p-7"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-[#EDEAE2]">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-label text-[10px] text-[#8A857B]">logo</span>
          )}
        </div>

        <div className="flex-1">
          <TextField
            label="Logo URL"
            placeholder="https://…"
            disabled={!canEdit}
            error={errors.companyLogo?.message}
            hint="Square PNG or JPEG, at least 256px. Shown on invitation emails and to owners."
            {...register("companyLogo")}
          />

          {canEdit && (
            <Button
              type="submit"
              disabled={!isDirty || updateCompany.isPending}
              className="mt-5"
            >
              {updateCompany.isPending ? "Saving…" : "Save logo"}
            </Button>
          )}
        </div>
      </div>

      <Callout tone="muted" className="mt-6">
        The API stores the logo as a URL — there's no upload endpoint for it
        yet, so host the image and paste its address here.
      </Callout>
    </form>
  );
};

const Company = () => {
  const { viewRole } = useAuth();
  const [tab, setTab] = useState<"details" | "branding">("details");

  const { data: company, isPending, isError, error } = useCompany();
  const canEdit = viewRole === "admin";

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-8">
        <h1 className="font-serif text-[30px] leading-tight text-[#141412] sm:text-[42px]">
          Company
        </h1>
        <p className="mt-1 text-[15px] text-[#6B665C]">
          {tab === "branding"
            ? "How your company appears to owners and on invitations."
            : canEdit
              ? "Your workspace details. Only admins can change these."
              : "Read-only for managers."}
        </p>
      </div>

      <Tabs
        label="Company views"
        value={tab}
        onChange={setTab}
        options={[
          { value: "details", label: "Details" },
          { value: "branding", label: "Branding" },
        ]}
      />

      <div className="mt-6">
        {isPending ? (
          <Skeleton className="h-[320px] rounded-[16px]" />
        ) : isError ? (
          <Callout tone="warning" title="We couldn't load your company">
            {getApiErrorMessage(error)}
          </Callout>
        ) : tab === "details" ? (
          <DetailsTab company={company} canEdit={canEdit} />
        ) : (
          <BrandingTab company={company} canEdit={canEdit} />
        )}
      </div>
    </div>
  );
};

export default Company;
