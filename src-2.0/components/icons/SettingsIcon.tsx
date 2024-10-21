import { h } from "preact";
import React from "preact/compat";

export const SettingsIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <g clip-path="url(#clip0_74_8039)">
        <path
          d="M8.00008 10C9.10465 10 10.0001 9.10457 10.0001 8C10.0001 6.89543 9.10465 6 8.00008 6C6.89551 6 6.00008 6.89543 6.00008 8C6.00008 9.10457 6.89551 10 8.00008 10Z"
          stroke="var(--sds-color-icon-default-default)"
          stroke-opacity="0.7"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M12.9334 10C12.8447 10.2011 12.8182 10.4241 12.8574 10.6404C12.8966 10.8567 12.9997 11.0562 13.1534 11.2133L13.1934 11.2533C13.3174 11.3772 13.4157 11.5242 13.4828 11.6861C13.5499 11.8479 13.5845 12.0214 13.5845 12.1967C13.5845 12.3719 13.5499 12.5454 13.4828 12.7073C13.4157 12.8691 13.3174 13.0162 13.1934 13.14C13.0696 13.264 12.9225 13.3623 12.7607 13.4294C12.5988 13.4965 12.4253 13.531 12.2501 13.531C12.0749 13.531 11.9014 13.4965 11.7395 13.4294C11.5776 13.3623 11.4306 13.264 11.3067 13.14L11.2667 13.1C11.1096 12.9463 10.9101 12.8432 10.6938 12.804C10.4775 12.7648 10.2545 12.7913 10.0534 12.88C9.85623 12.9645 9.68807 13.1048 9.56962 13.2837C9.45117 13.4625 9.3876 13.6721 9.38675 13.8867V14C9.38675 14.3536 9.24627 14.6928 8.99622 14.9428C8.74617 15.1929 8.40704 15.3333 8.05341 15.3333C7.69979 15.3333 7.36065 15.1929 7.11061 14.9428C6.86056 14.6928 6.72008 14.3536 6.72008 14V13.94C6.71492 13.7193 6.64349 13.5053 6.51509 13.3258C6.38668 13.1463 6.20724 13.0095 6.00008 12.9333C5.799 12.8446 5.57595 12.8181 5.35969 12.8573C5.14343 12.8965 4.94387 12.9996 4.78675 13.1533L4.74675 13.1933C4.62292 13.3173 4.47587 13.4156 4.314 13.4827C4.15214 13.5498 3.97864 13.5844 3.80341 13.5844C3.62819 13.5844 3.45469 13.5498 3.29283 13.4827C3.13096 13.4156 2.98391 13.3173 2.86008 13.1933C2.73611 13.0695 2.63777 12.9224 2.57067 12.7606C2.50357 12.5987 2.46903 12.4252 2.46903 12.25C2.46903 12.0748 2.50357 11.9013 2.57067 11.7394C2.63777 11.5775 2.73611 11.4305 2.86008 11.3067L2.90008 11.2667C3.05377 11.1095 3.15687 10.91 3.19608 10.6937C3.2353 10.4775 3.20882 10.2544 3.12008 10.0533C3.03557 9.85615 2.89525 9.68799 2.71639 9.56954C2.53753 9.45109 2.32794 9.38752 2.11341 9.38667H2.00008C1.64646 9.38667 1.30732 9.24619 1.05727 8.99614C0.807224 8.74609 0.666748 8.40695 0.666748 8.05333C0.666748 7.69971 0.807224 7.36057 1.05727 7.11052C1.30732 6.86048 1.64646 6.72 2.00008 6.72H2.06008C2.28074 6.71484 2.49475 6.64341 2.67428 6.51501C2.85381 6.3866 2.99056 6.20716 3.06675 6C3.15549 5.79892 3.18196 5.57587 3.14275 5.35961C3.10354 5.14334 3.00044 4.94378 2.84675 4.78667L2.80675 4.74667C2.68278 4.62283 2.58443 4.47578 2.51733 4.31392C2.45024 4.15206 2.4157 3.97855 2.4157 3.80333C2.4157 3.62811 2.45024 3.45461 2.51733 3.29275C2.58443 3.13088 2.68278 2.98383 2.80675 2.86C2.93058 2.73603 3.07763 2.63769 3.23949 2.57059C3.40136 2.50349 3.57486 2.46895 3.75008 2.46895C3.9253 2.46895 4.0988 2.50349 4.26067 2.57059C4.42253 2.63769 4.56958 2.73603 4.69341 2.86L4.73341 2.9C4.89053 3.05369 5.09009 3.15679 5.30635 3.196C5.52262 3.23521 5.74567 3.20874 5.94675 3.12H6.00008C6.19726 3.03549 6.36543 2.89517 6.48388 2.71631C6.60233 2.53745 6.66589 2.32786 6.66675 2.11333V2C6.66675 1.64638 6.80722 1.30724 7.05727 1.05719C7.30732 0.807142 7.64646 0.666666 8.00008 0.666666C8.3537 0.666666 8.69284 0.807142 8.94289 1.05719C9.19294 1.30724 9.33341 1.64638 9.33341 2V2.06C9.33427 2.27452 9.39784 2.48412 9.51629 2.66298C9.63474 2.84184 9.8029 2.98216 10.0001 3.06667C10.2012 3.15541 10.4242 3.18188 10.6405 3.14267C10.8567 3.10346 11.0563 3.00036 11.2134 2.84667L11.2534 2.80667C11.3772 2.6827 11.5243 2.58435 11.6862 2.51725C11.848 2.45015 12.0215 2.41562 12.1967 2.41562C12.372 2.41562 12.5455 2.45015 12.7073 2.51725C12.8692 2.58435 13.0162 2.6827 13.1401 2.80667C13.264 2.9305 13.3624 3.07755 13.4295 3.23941C13.4966 3.40128 13.5311 3.57478 13.5311 3.75C13.5311 3.92522 13.4966 4.09872 13.4295 4.26059C13.3624 4.42245 13.264 4.5695 13.1401 4.69333L13.1001 4.73333C12.9464 4.89045 12.8433 5.09001 12.8041 5.30627C12.7649 5.52254 12.7913 5.74559 12.8801 5.94667V6C12.9646 6.19718 13.1049 6.36534 13.2838 6.48379C13.4626 6.60224 13.6722 6.66581 13.8867 6.66667H14.0001C14.3537 6.66667 14.6928 6.80714 14.9429 7.05719C15.1929 7.30724 15.3334 7.64638 15.3334 8C15.3334 8.35362 15.1929 8.69276 14.9429 8.94281C14.6928 9.19286 14.3537 9.33333 14.0001 9.33333H13.9401C13.7256 9.33419 13.516 9.39775 13.3371 9.5162C13.1582 9.63465 13.0179 9.80282 12.9334 10Z"
          stroke="var(--sds-color-icon-default-default)"
          stroke-opacity="0.7"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_74_8039">
          <rect width="16" height="16" stroke="var(--sds-color-icon-default-default)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};
